const serializeBigInt = (value, visited = new WeakSet()) => {
  // Xử lý null hoặc undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Xử lý BigInt
  if (typeof value === "bigint") {
    return value.toString();
  }

  // Xử lý Date objects (DateTime từ Prisma) - PHẢI kiểm tra trước Array và Object
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Xử lý Array
  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInt(item, visited));
  }

  // Xử lý Object (nhưng không xử lý null)
  if (typeof value === "object") {
    // Tránh circular reference
    if (visited.has(value)) {
      return "[Circular]";
    }

    // Đánh dấu object đã được visit
    visited.add(value);

    try {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [
          key,
          serializeBigInt(val, visited),
        ]),
      );
    } finally {
      // Không cần remove vì WeakSet tự động cleanup
    }
  }

  return value;
};

module.exports = {
  serializeBigInt,
};
