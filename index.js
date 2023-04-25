const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();


//provide api endpoint
app.get('/generate-pdf', (req, res) => {
  
console.log(req.query.dashboardUrl);
  const dashboardUrl = decodeURIComponent(req.query.dashboardUrl);
  const token = req.query.token;

  const d = new Date();
  const dTime = d.getTime();
  const filename = req.query.filename

  const outputFilePath = `./output/${filename}_${dTime}.pdf`;

  const command = `node grafana_pdf.js ${dashboardUrl} ${token} ${outputFilePath}`;
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error generating PDF');
      return;
    }

    console.log(`PDF generated at ${outputFilePath}`);

    var file = fs.createReadStream(outputFilePath);
    var stat = fs.statSync(outputFilePath);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename='+filename+'.pdf');

    file.on('end', function() {
      fs.unlink(outputFilePath, function() {
        // file deleted
      });
    });

    file.pipe(res);

    //res.send('PDF generated');
  });
});

app.listen(3001, () => {
  console.log('Server started');
});