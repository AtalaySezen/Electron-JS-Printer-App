let selectedFilePath = null;

window.addEventListener("DOMContentLoaded", async () => {
  const printers = await window.api.getPrinters();
  const select = document.getElementById("printerSelect");

  printers.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.innerText = name;
    select.appendChild(opt);
  });

  // PDF seçme butonuna tıklanınca dosya seç
  document.getElementById("selectFileBtn").addEventListener("click", async () => {
    const filePath = await window.api.selectPdf();
    if (filePath) {
      selectedFilePath = filePath;
      document.getElementById("selectedFileName").innerText = filePath;
    }
  });

  // Yazdır butonuna tıklanınca
  document.getElementById("printBtn").addEventListener("click", async () => {
    const printerName = select.value;
    if (!printerName || !selectedFilePath) {
      alert("Yazıcı ve dosya seçmelisin!");
      return;
    }

    await window.api.print(printerName, selectedFilePath);
  });
});
