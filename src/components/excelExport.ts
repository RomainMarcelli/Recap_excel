import * as XLSX from "xlsx";

interface ExcelData {
  Nom: string;
  Projets: string;
  "Total Jours Travaillés": number;
  "TJM Total (€)": string;
  Commentaires: string;
}

export const exportToStyledExcel = (data: ExcelData[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  // ✅ Appliquer du style à la première ligne (en-têtes)
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "0070C0" } }, // ✅ Bleu pour le fond
    alignment: { horizontal: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // ✅ Style pour le reste du tableau
  const cellStyle = {
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
    alignment: { horizontal: "center" },
  };

  // 🔥 Appliquer les styles aux en-têtes
  const range = XLSX.utils.decode_range(worksheet["!ref"]!);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_col(col) + "1";
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = headerStyle;
  }

  // 🔥 Appliquer les styles aux cellules
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = cellStyle;
    }
  }

  // ✅ Ajuster la largeur des colonnes
  worksheet["!cols"] = [
    { wch: 20 }, // Nom
    { wch: 30 }, // Projets
    { wch: 18 }, // Total Jours Travaillés
    { wch: 18 }, // TJM Total
    { wch: 30 }, // Commentaires
  ];

  // ✅ Création du fichier Excel
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Collaborateurs");

  // ✅ Générer et télécharger
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
