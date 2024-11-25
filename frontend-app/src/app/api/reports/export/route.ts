import { exportLogsToCSV, exportLogsToPDF } from '@/lib/utils'; // Function to generate PDF
import LampUsageLog from '@/models/LampUsageLog';
import EventLog from '@/models/EventLog';

export async function POST(req: Request) {
  try {
    const { format } = await req.json();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(Date.now());

    // Fetch lamp usage logs
    const lampUsageLogs = await LampUsageLog.find({
      timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).sort({ timestamp: 1 });

    // Fetch power ON/OFF logs
    const eventLogs = await EventLog.find({
      timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).sort({ timestamp: 1 });

    // Prepare combined data for export
    const combinedLogs = [
      ...lampUsageLogs.map((log) => ({
        type: 'Lamp Usage',
        projectorIp: log.projectorIp,
        projecrotName: log.projectorName,
        details: `${log.usageHours} hours`,
        timestamp: log.timestamp,
      })),
      ...eventLogs.map((log) => ({
        type: 'Power Event',
        projectorIp: log.projectorIp,
        projectorName: log.projectorName,
        details: log.eventType === 'POWER_ON' ? 'Power ON' : 'Power OFF',
        timestamp: log.timestamp,
      })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Export based on format
    if (format === 'csv') {
      const fields = ['timestamp', 'projectorName', 'projectorIp', 'type', 'details'];
      const csv = exportLogsToCSV(combinedLogs, fields);

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report.csv"`,
        },
      });
    } else if (format === 'pdf') {
      const pdf = exportLogsToPDF(combinedLogs, 'Combined Logs Report');

      return new Response(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="report.pdf"`,
        },
      });
    } else {
      return new Response('Invalid format specified', { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting logs:', error);
    return new Response('Error exporting logs', { status: 500 });
  }
}
