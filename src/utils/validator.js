const removeComma = (num) => {
  return String(num).replace(/,/g, "");
};

const addComma = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatWon = (num) =>
  `${Math.round(Number(num)).toLocaleString("ko-KR")}원`;

export { addComma, formatWon, removeComma };
