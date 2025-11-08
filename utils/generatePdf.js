import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateSalarySlip = async (salaryData, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Load custom font (optional)
      const fontPath = path.resolve("fonts", "NotoSans-Regular.ttf");
      if (fs.existsSync(fontPath)) {
        doc.font(fontPath);
      } else {
        doc.font("Helvetica");
      }

      // Add Company Logo
      const logoPath = path.resolve("assets", "logo.png"); // <-- place your logo file here
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60 });
      }

      // Company Details
      doc
        .fontSize(16)
        .text("TechWave Solutions Pvt. Ltd.", 120, 50)
        .fontSize(10)
        .text("123 Business Park, Bengaluru, India", 120, 70)
        .text("Email: hr@techwave.com | Phone: +91 98765 43210", 120, 85);

      // Horizontal line
      doc.moveTo(50, 110).lineTo(550, 110).stroke();

      // Title
      doc
        .fontSize(18)
        .text("Salary Slip", { align: "center", underline: true, margin: 20 })
        .moveDown(1.5);

      // Employee Details Section
      doc.fontSize(12);
      doc.text(`Employee Name : ${salaryData.employee?.name ?? "N/A"}`);
      doc.text(`Employee ID    : ${salaryData.employee?._id ?? "N/A"}`);
      doc.text(`Month          : ${salaryData.month} ${salaryData.year}`);
      
      doc.moveDown();

      // Salary Table Header
      const startX = 50;
      let y = doc.y;
      doc.fontSize(13).text("Earnings & Deductions", { align: "center" });
      y += 20;

      doc
        .fontSize(11)
        .text("Component", startX, y)
        .text("Amount (Rs.)", 400, y);
      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();

      // Salary Details
      y += 25;
      doc.text("Basic Salary", startX, y).text(`Rs.${salaryData.basicSalary}`, 400, y);
      y += 20;
      doc.text("Bonus", startX, y).text(`Rs.${salaryData.bonus}`, 400, y);
      y += 20;
      doc.text("Deductions", startX, y).text(`Rs.${salaryData.deductions}`, 400, y);

      // Net Salary Highlight
      y += 40;
      doc
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke()
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Net Salary", startX, y + 10)
        .text(`Rs.${salaryData.netSalary}`, 400, y + 10)
        .font("Helvetica");

      // Footer
      doc.moveDown(4);
      doc
        .fontSize(10)
        .text("This is a system-generated payslip. No signature required.", {
          align: "center",
        });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};
