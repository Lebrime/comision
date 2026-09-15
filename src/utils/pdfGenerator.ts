import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AforoRecord } from '../types';

export function exportAforoToPDF(aforo: AforoRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(0, 28, pageWidth, 2.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('COMISION DE USUARIOS SUB SECTOR HIDRAULICO ', margin, 10);
  doc.text('          MEDIO PIURA MARGEN DERECHA', margin, 15);
  doc.text('REPORTE TÉCNICO DE AFORO DE CAUDAL', margin, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('MÉTODO DEL FLOTADOR SUPERFICIAL | OPERACION Y MANTENIMIENTO', margin, 25);

  // Document Code badge in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 182, 212);
  doc.text(`CÓDIGO: ${aforo.code || 'AF-001'}`, pageWidth - margin, 18, { align: 'right' });

  let y = 38;

  // General Info Section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. DATOS GENERALES DEL AFORO', margin + 4, y + 6);

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 2;
  const lineGap = 6;
  let infoY = y + 13;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Canal / Fuente:', col1, infoY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(aforo.channelName || 'Sin especificar', col1 + 25, infoY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha y Hora:', col2, infoY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const formattedDate = new Date(aforo.createdAt).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(formattedDate, col2 + 23, infoY);

  infoY += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Ubicación / Sector:', col1, infoY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(aforo.sectorLocation || 'No registrada', col1 + 28, infoY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Aforador / Técnico:', col2, infoY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(aforo.operatorName || 'No especificado', col2 + 29, infoY);

  infoY += lineGap;
  if (aforo.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Observaciones:', col1, infoY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const splitNotes = doc.splitTextToSize(aforo.notes, contentWidth - 35);
    doc.text(splitNotes[0] || '', col1 + 24, infoY);
  }

  y += 40;

  // Hydraulic & Geometry Parameters Section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. PARÁMETROS GEOMÉTRICOS E HIDRÁULICOS DEL TRAMO', margin + 4, y + 6);

  const pCol1 = margin + 4;
  const pCol2 = margin + contentWidth * 0.33;
  const pCol3 = margin + contentWidth * 0.66;
  let paramY = y + 14;

  // Fila 1
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Distancia del tramo (L):', pCol1, paramY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`${aforo.distanceMeters.toFixed(2)} m`, pCol1 + 36, paramY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Espejo de agua (T):', pCol2, paramY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${aforo.geometry.waterSurfaceWidth.toFixed(2)} m`, pCol2 + 30, paramY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Tirante de agua (y):', pCol3, paramY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${aforo.geometry.waterDepth.toFixed(2)} m`, pCol3 + 30, paramY);

  // Fila 2
  paramY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Base menor (b):', pCol1, paramY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${aforo.geometry.bottomWidth.toFixed(2)} m`, pCol1 + 25, paramY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Factor corrección (K):', pCol2, paramY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${aforo.correctionFactor.toFixed(2)}`, pCol2 + 33, paramY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Área hidráulica (A):', pCol3, paramY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`${aforo.results.hydraulicArea.toFixed(4)} m²`, pCol3 + 30, paramY);

  // Fila 3
  paramY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Forma de sección:', pCol1, paramY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const shapeName = aforo.geometry.shape === 'trapezoidal' ? 'Trapezoidal' : aforo.geometry.shape === 'rectangular' ? 'Rectangular' : 'Triangular';
  doc.text(shapeName, pCol1 + 28, paramY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Talud lateral (Z):', pCol2, paramY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${aforo.results.sideSlopeZ.toFixed(3)} : 1`, pCol2 + 26, paramY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Radio Hidráulico (Rh):', pCol3, paramY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${aforo.results.hydraulicRadius.toFixed(4)} m`, pCol3 + 33, paramY);

  y += 44;

  // Table of Time Readings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. REGISTRO DETALLADO DE LECTURAS DE TIEMPO (CRONÓMETRO)', margin, y + 2);

  const tableData = aforo.readings.map((reading) => {
    const punctualVelocity = reading.timeSeconds > 0 ? (aforo.distanceMeters / reading.timeSeconds).toFixed(3) : '0.000';
    const diff = (reading.timeSeconds - aforo.results.averageTime).toFixed(2);
    const sign = Number(diff) > 0 ? `+${diff}` : `${diff}`;
    return [
      `Lectura #${reading.index}`,
      `${reading.timeSeconds.toFixed(2)} s`,
      `${punctualVelocity} m/s`,
      reading.isExcluded ? '---' : `${sign} s`,
      reading.timestamp || '-',
      reading.isExcluded ? 'Excluida' : 'Válida',
    ];
  });

  autoTable(doc, {
    startY: y + 5,
    head: [['N°', 'Tiempo Registrado', 'Velocidad Puntual', 'Desviación vs Media', 'Hora Lectura', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
  });

  // Position after table
  const finalTableY = (doc as any).lastAutoTable.finalY + 8;
  y = finalTableY;

  // Results High-Impact Box
  doc.setFillColor(8, 145, 178); // cyan-600
  doc.rect(margin, y, contentWidth, 38, 'F');

  doc.setFillColor(14, 116, 144); // cyan-700
  doc.rect(margin, y, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('4. RESULTADOS FINALES DE AFORO (CAUDAL Y VELOCIDAD)', margin + 4, y + 6);

  // Main Flow Q display
  const resCol1 = margin + 6;
  const resCol2 = margin + contentWidth * 0.52;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(224, 242, 254); // cyan-100
  doc.text('CAUDAL O GASTO TOTAL (Q):', resCol1, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(`${aforo.results.dischargeLps.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L/s`, resCol1, y + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(207, 250, 254);
  doc.text(`( ${aforo.results.dischargeM3s.toFixed(4)} m³/s | ${aforo.results.dischargeM3h.toLocaleString('es-ES', { maximumFractionDigits: 1 })} m³/h )`, resCol1, y + 32);

  // Complementary speeds and times
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 242, 254);

  doc.text(`• Tiempo promedio (t_prom):`, resCol2, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${aforo.results.averageTime.toFixed(2)} s  (N=${aforo.results.readingsCount})`, resCol2 + 45, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 242, 254);
  doc.text(`• Velocidad superficial (V_sup):`, resCol2, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${aforo.results.surfaceVelocity.toFixed(4)} m/s`, resCol2 + 45, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 242, 254);
  doc.text(`• Velocidad media (V_med):`, resCol2, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`${aforo.results.meanVelocity.toFixed(4)} m/s`, resCol2 + 45, y + 27);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 242, 254);
  doc.text(`• Desviación estándar (σ):`, resCol2, y + 33);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`±${aforo.results.stdDeviation.toFixed(3)} s`, resCol2 + 45, y + 33);

  y += 48;

  // Check if we need a new page or fit signatures
  if (y + 35 > pageHeight - margin) {
    doc.addPage();
    y = 25;
  }

  // Signatures Section
  const sigWidth = 70;
  const sig1X = margin + 15;
  const sig2X = pageWidth - margin - sigWidth - 15;

  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.4);
  doc.line(sig1X, y + 18, sig1X + sigWidth, y + 18);
  doc.line(sig2X, y + 18, sig2X + sigWidth, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('AFORADOR / TÉCNICO RESPONSABLE', sig1X + sigWidth / 2, y + 23, { align: 'center' });
  doc.text('V° B° SUPERVISOR HIDRÁULICO', sig2X + sigWidth / 2, y + 23, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(aforo.operatorName || 'Firma y Sello', sig1X + sigWidth / 2, y + 27, { align: 'center' });
  doc.text('Firma, Sello y Colegiatura', sig2X + sigWidth / 2, y + 27, { align: 'center' });

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generado con Aforo por Flotador Móvil • ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`,
      margin,
      pageHeight - 6
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // Download trigger
  const sanitizeFilename = (aforo.channelName || 'Aforo')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 20);
  const filename = `Aforo_${aforo.code || 'DOC'}_${sanitizeFilename}.pdf`;

  doc.save(filename);
}
