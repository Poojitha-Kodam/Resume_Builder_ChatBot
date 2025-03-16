from flask import Flask, request, jsonify, send_file, render_template
import pdfkit
import os
import glob
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure wkhtmltopdf path
config = pdfkit.configuration(wkhtmltopdf="C:/Program Files/wkhtmltopdf/bin/wkhtmltopdf.exe")

# Ensure output folder exists
output_folder = os.path.join(os.getcwd(), "output")
os.makedirs(output_folder, exist_ok=True)

# Available templates
templates = ["template1.html", "template2.html", "template3.html"]

@app.route("/")
def home():
    return "Flask server is running!"

def clean_output_folder():
    """Delete old PDF files if more than 4 exist in the output folder."""
    try:
        pdf_files = sorted(
            glob.glob(os.path.join(output_folder, "*.pdf")),
            key=os.path.getctime
        )
        
        if len(pdf_files) > 4:
            files_to_delete = pdf_files[:-4]  # Keep only the latest 4
            for pdf in files_to_delete:
                os.remove(pdf)
                print(f"🗑️ Deleted old PDF: {os.path.basename(pdf)}")
    except Exception as e:
        print(f"⚠️ Error while cleaning output folder: {e}")

@app.route("/generate-resume", methods=["POST"])
def generate_resume():
    try:
        data = request.json

        # Ensure output folder exists
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # Clean old files before generating a new one
        clean_output_folder()

        # Select user template or default to template1
        template_id = int(data.get("template", 1))
        selected_template = templates[template_id - 1]
        print(f"Selected Template: {selected_template}")

        # Render HTML template with user data and defaults
        rendered_html = render_template(
            selected_template,
            name=data.get("name", "John Doe"),
            title=data.get("title", "Software Engineer"),
            contactInfo=data.get("contactInfo", {}),
            summary=data.get("summary", "Highly motivated professional with expertise in delivering high-impact projects."),
            workExperience=data.get("workExperience", []),
            education=data.get("education", []),
            skills=data.get("skills", ["Leadership", "Problem-Solving", "Project Management"]),
            certifications=data.get("certifications", ["Certified Scrum Master (CSM)"]),
            projects=data.get("projects", [{"name": "Project Alpha", "description": "Led project delivery with on-time results."}]),
            languages=data.get("languages", "English (Fluent), Spanish (Intermediate)"),
            achievements=data.get("achievements", "Recognized for exceptional performance and leadership.")
        )

        # Generate unique PDF filename
        timestamp = int(time.time())
        pdf_filename = f"output_resume_{timestamp}.pdf"
        pdf_path = os.path.join(output_folder, pdf_filename)

        print(f"Saving PDF to: {pdf_path}")

        # Generate PDF from HTML using pdfkit
        options = {
            "enable-local-file-access": "",
            "page-size": "A4",
            "encoding": "UTF-8",
            "margin-top": "10mm",
            "margin-right": "10mm",
            "margin-bottom": "10mm",
            "margin-left": "10mm",
        }

        pdfkit.from_string(rendered_html, pdf_path, configuration=config, options=options)

        if os.path.exists(pdf_path):
            print(f"✅ PDF generated successfully: {pdf_path}")
            return jsonify({"message": "Resume generated successfully!", "download_link": f"/download-resume/{pdf_filename}"})
        else:
            print("❌ Error: PDF file not found after generation.")
            return jsonify({"message": "Failed to generate PDF"}), 500
    
    except Exception as e:
        print(f"❌ Error generating resume: {e}")
        return jsonify({"message": "Failed to generate resume", "error": str(e)}), 500

@app.route("/download-resume/<filename>", methods=["GET"])
def download_resume(filename):
    pdf_path = os.path.join(output_folder, filename)
    if os.path.exists(pdf_path):
        return send_file(pdf_path, as_attachment=True, mimetype="application/pdf")
    else:
        return jsonify({"message": "Resume not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
