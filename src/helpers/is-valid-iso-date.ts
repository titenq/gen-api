const isValidISODate = (dateString: string): boolean => {
  if (typeof dateString !== "string") {
    return false;
  }

  const date = new Date(dateString);

  return (
    !isNaN(date.getTime()) &&
    date.toISOString().slice(0, dateString.length) === dateString
  );
};

export default isValidISODate;
