
function formatDate(date, separator = '') {
    if ((typeof date === 'string' || date instanceof String)) {
        date = date.replace(/[^0-9]/g, "");
        return date.substring(0, 4) + separator + date.substring(4, 6) + separator + date.substring(6, 8);
    }
    const yyyy = date.getFullYear();
    let mm = date.getMonth() + 1; // Months start at 0!
    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return yyyy + separator + mm + separator + dd;
  }
  
function toReadable(date) {
    const date2 = new Date(formatDate(date, '-'));
    // request a weekday along with a long date
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
    };
  return date2.toLocaleDateString("fr-FR", options);
}
export var dateh = {
    formatDate: formatDate, 
    toReadable: toReadable,
}
