export function convertUtcToIst(utcTimeStr: string): string {

  const utcDate = new Date(utcTimeStr);
  const istOffset = 5.5 * 60 * 60 * 1000;

  const istDate = new Date(utcDate.getTime() + istOffset);

  const year = istDate.getFullYear().toString();
  const month = ('0' + (istDate.getMonth() + 1)).slice(-2);
  const day = ('0' + istDate.getDate()).slice(-2);
  const hours = ('0' + istDate.getHours()).slice(-2);
  const minutes = ('0' + istDate.getMinutes()).slice(-2);
  const seconds = ('0' + istDate.getSeconds()).slice(-2);

  return `${month}/${day}/${year}`;
}

const utcTimeExample = "2024-09-17T12:00:00Z";
console.log(`UTC Time: ${utcTimeExample}`);
const istTime = convertUtcToIst(utcTimeExample);
console.log(`IST Time: ${istTime}`);
