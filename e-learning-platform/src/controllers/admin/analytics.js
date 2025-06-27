exports.generateReports = async (req, res) => {
  const reports = {
    userGrowth: await User.aggregate([
      { $group: { 
        _id: { $month: "$createdAt" }, 
        count: { $sum: 1 } 
      }}
    ]),
    courseStats: await Course.aggregate([
      { $group: { 
        _id: "$status", 
        count: { $sum: 1 } 
      }}
    ])
  };

  res.render('admin/analytics/reports', { reports });
};

   const { createObjectCsvWriter } = require('csv-writer');
   const PDFDocument = require('pdfkit');
	
   exports.exportCSV = async (req, res) => {
     const data = await generateReportData(); // Sua função existente

     const csvWriter = createObjectCsvWriter({
       path: 'temp/report.csv',
       header: [
         { id: 'month', title: 'Mês' },
         { id: 'users', title: 'Novos Usuários' }
       ]
     });

     await csvWriter.writeRecords(data.userGrowth);
     res.download('temp/report.csv');
   };

   exports.exportPDF = (req, res) => {
     const doc = new PDFDocument();
     doc.pipe(res);
     doc.text('Relatório de Usuários', { align: 'center' });
     // Adicionar dados...
     doc.end();
   };
