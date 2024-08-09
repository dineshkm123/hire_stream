export function getDate(sqlDate) {
 return new Date(new Date(sqlDate).getTime() + 5.5 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
}
