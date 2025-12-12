# Hướng Dẫn: Sửa Lỗi Navigation Nút "Bid Now" Trên ProductCard

## Vấn Đề Gốc

Khi nhấn nút **"Bid Now"** trên ProductCard (ở trang chủ hoặc danh sách sản phẩm), nó **không navigate đến trang chi tiết sản phẩm** như mong đợi.

---

## Nguyên Nhân

### 1. **Logic Click của Nút "Bid Now" Sai**

Trước khi sửa, nút "Bid Now" chỉ gọi hàm `onBid()`:

```jsx
<button
  onClick={(e) => {
    if (props.isOwner && props.onEdit) {
      e.stopPropagation();
      props.onEdit();
    } else if (onBid) {
      e.stopPropagation();
      onBid(); // ← Chỉ log ra console, không navigate
    }
  }}
>
  {getButtonText()}
</button>
```

Khi gọi từ `ProductSection.jsx`, prop `onBid` được set là:

```jsx
onBid={() => console.log("Bid on:", item.name || item.title)}
```

✗ **Kết quả:** Chỉ log console, không đi đến trang chi tiết

---

### 2. **Điều Kiện Click Container Sai**

Trước đây, container div có `onClick={onClick}` (navigate function) nhưng **nó không hoạt động đúng** vì:

- Khi click button, event bubble up đến container
- Nhưng button cũng chặn propagation (`stopPropagation()`)
- Nên lúc nào cũng không navigate được

---

## Cách Sửa (2 Thay Đổi)

### **Thay Đổi 1: Cập Nhật Logic Container Div**

**File:** `client/src/components/common/ProductCard.jsx` (dòng ~149)

**Trước:**

```jsx
<div
  className={`...`}
  onClick={onClick}  // ← Click trực tiếp, không kiểm tra
>
```

**Sau:**

```jsx
<div
  className={`...`}
  onClick={(e) => {
    // Chỉ navigate nếu click không phải vào button hoặc icon khác
    if (onClick && e.target.closest('button') === null) {
      onClick(e);
    }
  }}
>
```

**Giải thích:**

- `e.target.closest('button')` kiểm tra xem click có phải vào button không
- Nếu click vào button → `return` (không navigate)
- Nếu click vào chỗ khác của card → gọi `onClick()` (navigate)
- **Lợi ích:** Cho phép button xử lý sự kiện riêng của nó

---

### **Thay Đổi 2: Cập Nhật Logic Nút "Bid Now"**

**File:** `client/src/components/common/ProductCard.jsx` (dòng ~304)

**Trước:**

```jsx
<button
  onClick={(e) => {
    if (props.isOwner && props.onEdit) {
      e.stopPropagation();
      props.onEdit();
    } else if (onBid) {
      e.stopPropagation();
      onBid(); // ← Chỉ log, không navigate
    }
  }}
>
  {getButtonText()}
</button>
```

**Sau:**

```jsx
<button
  onClick={(e) => {
    e.stopPropagation();
    // Nếu là chủ sản phẩm, cho edit; còn không thì navigate đến chi tiết sản phẩm
    if (props.isOwner && props.onEdit) {
      props.onEdit();
    } else if (onClick) {
      // Navigate đến trang chi tiết sản phẩm
      onClick(e);
    } else if (onBid) {
      onBid();
    }
  }}
>
  {getButtonText()}
</button>
```

**Giải thích:**

- **Dòng 1:** `e.stopPropagation()` - chặn event bubble lên parent
- **Dòng 3-5:** Nếu là chủ sản phẩm (seller) → gọi `onEdit()` để edit sản phẩm
- **Dòng 6-8:** Nếu là người mua (bidder) → gọi `onClick()` để **navigate đến chi tiết sản phẩm**
- **Dòng 9-11:** Fallback nếu không có `onClick` prop (dùng `onBid`)

---

## Luồng Hoạt Động Sau Sửa

### **Scenario 1: Người dùng nhấn nút "Bid Now" (Bidder)**

```
Click vào nút "Bid Now"
    ↓
Nút button xử lý: onClick → e.stopPropagation()
    ↓
Kiểm tra: !isOwner && onClick tồn tại → TRUE
    ↓
Gọi onClick(e) → navigate(`/products/${id}`)
    ↓
✓ Chuyển đến trang chi tiết sản phẩm
```

### **Scenario 2: Seller nhấn nút "Edit" (Owner)**

```
Click vào nút "Edit"
    ↓
Nút button xử lý: onClick → e.stopPropagation()
    ↓
Kiểm tra: isOwner && onEdit tồn tại → TRUE
    ↓
Gọi onEdit() → navigate đến trang edit
    ↓
✓ Chuyển đến trang edit sản phẩm
```

### **Scenario 3: Click vào vùng khác của card (ví dụ tiêu đề)**

```
Click vào tiêu đề sản phẩm
    ↓
Container div xử lý: onClick
    ↓
Kiểm tra: e.target.closest('button') === null → TRUE
    ↓
Gọi onClick(e) → navigate(`/products/${id}`)
    ↓
✓ Chuyển đến trang chi tiết sản phẩm
```

### **Scenario 4: Click vào icon Watchlist ❤️**

```
Click vào icon ❤️
    ↓
Button watchlist xử lý: onClick → e.stopPropagation()
    ↓
Container không trigger (vì button chặn)
    ↓
Gọi onWatchlistToggle(id)
    ↓
✓ Thêm/xóa khỏi watchlist, không navigate
```

---

## Tóm Tắt Các Thay Đổi

| Thành Phần            | Trước                       | Sau                                                 |
| --------------------- | --------------------------- | --------------------------------------------------- |
| **Container onClick** | Navigate ngay               | Chỉ navigate khi click vào area (không phải button) |
| **Nút "Bid Now"**     | Gọi `onBid()` (log console) | Gọi `onClick()` để navigate                         |
| **Nút "Edit"**        | Gọi `onEdit()`              | Gọi `onEdit()` (không thay đổi)                     |
| **Icon Watchlist**    | Gọi `onWatchlistToggle()`   | Gọi `onWatchlistToggle()` (không thay đổi)          |

---

## Kiểm Tra

Sau khi sửa, hãy test các tác vụ:

✅ **Test 1:** Click nút "Bid Now" → Navigate đến `/products/:id`
✅ **Test 2:** Click tiêu đề sản phẩm → Navigate đến `/products/:id`
✅ **Test 3:** Click icon ❤️ → Thêm/xóa watchlist (không navigate)
✅ **Test 4:** (Seller) Nhấn nút "Edit" → Navigate đến trang edit

---

## Lưu Ý Kỹ Thuật

### 1. **Event Propagation**

- `stopPropagation()` ngăn event bubble lên parent
- Quan trọng để tránh trigger container onClick khi click button

### 2. **Event Target Detection**

- `e.target.closest('button')` tìm closest button ancestor
- Trả về `null` nếu không có button ancestor
- Cách này an toàn hơn so với kiểm tra `event.target` trực tiếp

### 3. **Conditional Navigation**

- Kiểm tra role (isOwner) trước
- Rồi kiểm tra action type (edit vs navigate)
- Đảm bảo mỗi role được xử lý đúng

---

## Tài Liệu Tham Khảo

- [React Event Delegation](https://react.dev/learn/responding-to-events)
- [Event.stopPropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)
- [Element.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
