const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

function removeSpecialCharacters(str) {
  return str.replace(/[^a-zA-Z0-9-_:\/&="?]/g, "");
}

//provide api endpoint
app.get("/generate-pdf", (req, res) => {
  //req paramenters:
  //container: grafana container_name
  //port: grafana port
  //dashlink: grafana all after main url ex: 'https://grafana_instance.ch/d/EPjhlwkVk/solar_admin?orgId=1&var-Filter=All&var-anlage=21105226' -> '/d/EPjhlwkVk/solar_admin?orgId=1&var-Filter=All&var-anlage=21105226'
  //token: grafana read token which has access to the dashboards
  //filename: name of the output file

  const container = removeSpecialCharacters(req.query.container);
  const port = removeSpecialCharacters(req.query.port);
  const dashlink = removeSpecialCharacters(req.query.dashlink);
  const token = removeSpecialCharacters(req.query.token);
  const filename = removeSpecialCharacters(req.query.filename);

  const dashboardUrl = `"http://${container}:${port}${dashlink}"`;
  console.log(dashboardUrl);
  const d = new Date();
  const dTime = d.getTime();

  const outputFilePath = `./output/${filename}_${dTime}.pdf`;

  const command = `node grafana_pdf.js ${dashboardUrl} ${token} ${outputFilePath}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error generating PDF");
      return;
    }

    console.log(`PDF generated at ${outputFilePath}`);

    var file = fs.createReadStream(outputFilePath);
    var stat = fs.statSync(outputFilePath);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=" + filename + ".pdf");

    file.on("end", function () {
      fs.unlink(outputFilePath, function () {
        // file deleted
      });
    });

    file.pipe(res);

    //res.send('PDF generated');
  });
});

app.listen(3001, () => {
  console.log("Server started");
});
