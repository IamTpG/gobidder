<style>
  div p {
    text-align: justify;
    text-justify: inter-word;
  }
  
  mark {
    background: none !important;
    color: #c0341d;
    font-weight: bold;
  }
  
  .markdown-body code {
    color: #c0341d !important;
    background-color: #fbe5e1 !important;
    font-weight: bold;
  }
  
  pre>code.hljs {
    color: inherit !important;
    background-color: inherit !important;
    font-weight: inherit !important;
  }
</style>

# PTUDW - Final Project - Online Auction

###### tags: `PTUDW-LT` `project`

:::info
Xây dựng ứng dụng **Sàn Đấu Giá Trực Tuyến**, gồm các phân hệ & chức năng sau
:::

## 1. Phân hệ người dùng nặc danh - **guest**

### 1.1 Hệ thống Menu

- Hiển thị danh sách danh mục **category**
- Có 2 cấp danh mục
  - Điện tử ➠ Điện thoại di động
  - Điện tử ➠ Máy tính xách tay
  - Thời trang ➠ Giày
  - Thời trang ➠ Đồng hồ
  - ...

### 1.2 Trang chủ

- Top 5 sản phẩm gần kết thúc
- Top 5 sản phẩm có nhiều lượt ra giá nhất
- Top 5 sản phẩm có giá cao nhất

### 1.3 Xem danh sách sản phẩm

- Theo danh mục **category**
- Có **phân trang**

### 1.4 Tìm kiếm sản phẩm

:::success
Sử dụng kỹ thuật `Full-text search`
:::

- Tìm theo **tên sản phẩm** and/or tìm theo **danh mục**
- **Phân trang** kết quả
- Sắp xếp theo ý người dùng
  - Thời gian kết thúc giảm dần
  - Giá tăng dần
- Những sản phẩm mới đăng (trong vòng N phút) sẽ có thể hiện khác với các sản phẩm còn lại (nổi bật hơn)

#### 1.4.1 Sản phẩm hiển thị trên trang danh sách gồm các thông tin

- Ảnh đại diện sản phẩm
- Tên sản phẩm
- Giá hiện tại
- Thông tin **bidder** đang đặt giá cao nhất
- Giá mua ngay (nếu có)
- Ngày đăng sản phẩm
- Thời gian còn lại
- Số lượt ra giá hiện tại

:::warning
Người dùng có thể click vào **category** để chuyển nhanh sang màn hình **XEM DANH SÁCH SẢN PHẨM**
:::

### 1.5 Xem chi tiết sản phẩm

- Nội dung đầy đủ của sản phẩm
  - Ảnh đại diện (size lớn)
  - Các ảnh phụ (ít nhất 3 ảnh)
  - Tên sản phẩm
  - Giá hiện tại
  - Giá mua ngay (nếu có)
  - Thông tin người bán & điểm đánh giá
  - Thông tin người đặt giá cao nhất hiện tại & điểm đánh giá
  - Thời điểm đăng
  - Thời điểm kết thúc
    - Nếu thời điểm kết thúc ít hơn 3 ngày thì thể hiện theo định dạng tương đối (relative time - 3 ngày nữa, 10 phút nữa, ...)
  - Mô tả chi tiết sản phẩm
- Lịch sử các câu hỏi và câu trả lời của những người tham gia đấu giá & người bán
- 5 sản phẩm khác cùng chuyên mục

### 1.6 Đăng ký

- Người dùng cần đăng ký tài khoản để có thể đặt giá (bid)
  - reCaptcha
  - Mật khẩu được mã hoá bằng thuật toán `bcrypt` hoặc `scrypt`
  - Thông tin
    - Họ tên
    - Địa chỉ
    - Email
      - Email không được trùng
      - Có **xác nhận OTP**

## 2. Phân hệ người mua **bidder**

### 2.1 Lưu 1 sản phẩm vào danh sách yêu thích **Watch List**

- Thực hiện tại view **Danh sách sản phẩm**
- Thực hiện tại view **Chi tiết sản phẩm**

### 2.2 Ra giá

- Thực hiện tại view **Chi tiết sản phẩm**
- Hệ thống kiểm tra điểm đánh giá (+/+-) hơn 80% thì mới cho phép ra giá
  - **Bidder** được đánh giá 10 lần, có 8+ và 2-, vậy điểm của **bidder** này là 8/10 ~ 80%, được phép tham gia đấu giá sản phẩm
  - **Bidder** chưa từng được đánh giá được phép ra giá sản phẩm trong trường hợp **người bán cho phép**
- Hệ thống đề nghị giá hợp lệ (giá hiện tại + bước giá do người bán thiết lập)
- Hệ thống yêu cầu xác nhận

### 2.3 Xem lịch sử đấu giá của sản phẩm

Thông tin người ra giá được che (mask) 1 phần

| Thời điểm        | Người mua     | Giá       |
| ---------------- | ------------- | --------- |
| 27/10/2025 10:43 | \*\*\*\*Khoa  | 6,000,000 |
| 27/10/2025 9:43  | \*\*\*\*Kha   | 5,900,000 |
| 27/10/2025 8:43  | \*\*\*\*Tuấn  | 5,800,000 |
| 27/10/2025 7:43  | \*\*\*\*Khánh | 5,700,000 |

### 2.4 Hỏi người bán về sản phẩm

- Thực hiện tại view **Xem chi tiết sản phẩm**
- Người bán nhận được email thông báo về câu hỏi của người mua, trong email có kèm link mở nhanh view **Xem chi tiết sản phẩm** để trả lời

### 2.5 Quản lý hồ sơ cá nhân

- Đổi thông tin email, họ tên, mật khẩu (có yêu cầu nhập mật khẩu cũ)
- Xem điểm đánh giá và chi tiết các lần được đánh giá & đoạn nhận xét mà người đánh giá gửi
- Xem danh sách sản phẩm yêu thích của mình
- Xem danh sách sản phẩm mà mình đang tham gia đấu giá
- Xem danh sách sản phẩm mà mình đã thắng (giá cao nhất)
  - Được phép đánh giá người bán :+1: (+1) hoặc :thumbsdown: (-1), gửi kèm 1 đoạn nhận xét

### 2.6 Xin được bán trong vòng 7 ngày

- **Bidder** gửi yêu cầu xin được upgrage thành **seller**
- Ban quản trị sẽ duyệt yêu cầu này

## 3. Người bán - **seller**

### 3.1 Đăng sản phẩm đấu giá

- Nhập đủ thông tin:
  - Tên sản phẩm
  - Tối thiểu 3 ảnh
  - Giá khởi điểm
  - Bước giá
  - Giá mua ngay (nếu có)
  - Mô tả sản phẩm
    - Hỗ trợ `WYSIWYG`
      - quilljs (https://quilljs.com)
      - TinyMCE (https://www.tiny.cloud)
      - ...
  - Có tự động gia hạn ko?
    - Nếu có, khi có lượt đấu giá mới trước khi kết thúc **5 phút**, sản phẩm tự động gia hạn thêm **10 phút**.
    - Các tham số 5 phút, 10 phút có thể được điều chỉnh bởi quản trị viên và sẽ áp dụng cho toàn bộ các sản phẩm

### 3.2 Bổ sung thông tin mô tả sản phẩm

- Bổ sung thông tin mô tả cho sản phẩm đã đăng
- Thông tin mới được chèn (append) vào mô tả cũ, không được phép thay thế mô tả cũ

```=
Sản phẩm đẹp.

✏️ 31/10/2025

Sản phẩm đã qua sử dụng.

✏️ 5/11/2025

Sản phẩm còn bảo hành.
```

### 3.3 Từ chối lượt ra giá của **bidder**

- Thực hiện tại view **Chi tiết sản phẩm**
- Người mua bị từ chối không được phép đấu giá sản phẩm này nữa
- Nếu người mua bị từ chối đang là người mua đặt giá cao nhất, sản phẩm chuyển cho người mua có giá cao thứ nhì.

### 3.4 Trả lời câu hỏi của người tham gia đấu giá

- Thực hiện tại view **Xem chi tiết sản phẩm**

### 3.5 Quản lý hồ sơ cá nhân (tt)

- Xem danh sách sản phẩm mình đang đăng & còn hạn
- Xem danh sách sản phẩm đã có người thắng đấu giá
  - Được phép đánh giá người thắng :+1: (+1) hoặc :thumbsdown: (-1), gửi kèm 1 đoạn nhận xét
  - Được phép huỷ giao dịch và tự động :thumbsdown: (-1) người thắng đấu giá. Trong trường hợp này, đoạn nhận xét có nội dung: **_Người thắng không thanh toán_**

## 4. Phân hệ quản trị viên - **administrator**

:::info
**Quản lý** bao gồm các thao tác sau:

1. Xem danh sách
1. Xem chi tiết
1. Thêm
1. Xoá
1. Cập nhật
1. Và các thao tác chuyên biệt khác
   :::

### 4.1 Quản lý danh mục **category**

- Các chức năng **quản lý** cơ bản
- Không được xoá danh mục đã có sản phẩm

### 4.2 Quản lý sản phẩm

- Gỡ bỏ sản phẩm

### 4.3 Quản lý danh sách người dùng

- Các chức năng **quản lý** cơ bản
- Xem danh sách **bidder** xin nâng cấp tài khoản
- Duyệt nâng cấp tài khoản **bidder** ➠ **seller**

## 5. Các tính năng chung cho các phân hệ người dùng

### 5.1 Đăng nhập

- Tự cài đặt
- Hoặc sử dụng `passportjs` (http://www.passportjs.org)
- _Khuyến khích_ cài đặt thêm chức năng đăng nhập qua Google, Facebook, Twitter, Github, ...

### 5.2 Cập nhật thông tin cá nhân

- Họ tên
- Email liên lạc
- Ngày tháng năm sinh

### 5.3 Đổi mật khẩu

- Mật khẩu được mã hoá bằng thuật toán `bcrypt` hoặc `scrypt`

### 5.4 Quên mật khẩu

- Yêu cầu xác nhận bằng email OTP

## 6. Hệ thống

### 6.1 Mailing System

Với mỗi giao dịch **quan trọng**, hệ thống gửi 1 email cho các bên liên quan nhằm thông báo

- Ra giá thành công, giá sản phẩm được cập nhật
  - Gửi người bán
  - Gửi người ra giá
  - Gửi người giữ giá trước đó (nếu có)
- Người mua bị từ chối ra giá
  - Người mua
- Đấu giá kết thúc, không có người mua
  - Người bán
- Đấu giá kết thúc
  - Người bán
  - Người thắng
- Người mua đặt câu hỏi
  - Người bán
- Người bán trả lời
  - Các người mua tham gia đấu giá & các người mua có đặt câu hỏi

### 6.2 Đấu giá tự động

Hệ thống hỗ trợ đấu giá **tự động**, giúp người mua có thể thắng được sản phẩm đấu giá với giá **thấp nhất** có thể

- Người mua ra **giá-tối-đa** mà mình có thể trả cho sản phẩm
- Giá hiện tại của sản phẩm sẽ liên tục được cập nhật dựa trên **giá-tối-đa** và **giá-tối-đa-của-người-mua-khác**
- Nếu 2 **bidder** ra cùng mức giá, **bidder** ra giá trước được ghi nhận là **người-ra-giá-cao-nhất**

#### 🧰 Thông tin sản phẩm đấu giá

- **iPhone 11**
- Giá khởi điểm 10tr
- Bước giá bội 100k

#### ❗️Đấu giá thông thường

| Bidder | Giá đặt    | Giá vào sản phẩm | Người giữ giá |
| :----- | :--------- | :--------------- | :------------ |
| #1     | 10,000,000 | 10,000,000       | #1            |
| #2     | 10,100,000 | 10,100,000       | #2            |
| #3     | 10,500,000 | 10,500,000       | #3            |
| #1     | 10,800,000 | 10,800,000       | #1            |
| #3     | 11,100,000 | 11,100,000       | #3            |

- **Bidder** cần thao tác liên tục để đưa giá mới vào sản phẩm

#### ❗️Đấu giá tự động

| Bidder | Giá tối đa | Giá vào sản phẩm | Người giữ giá |
| ------ | ---------- | ---------------- | ------------- |
| #1     | 11,000,000 | 10,000,000       | #1            |
| #2     | 10,800,000 | 10,800,000       | #1            |
| #3     | 11,500,000 | 11,100,000       | #3            |
| #4     | 11,500,000 | 11,500,000       | #3            |
| #4     | 11,700,000 | 11,600,000       | #4            |

- **Bidder** **_không_** cần thao tác liên tục để đưa giá mới vào sản phẩm
- Giá vào sản phẩm luôn lá giá vừa-đủ-thắng giá của **bidder** khác

Hệ thống chỉ cài đặt **đấu giá tự động** hoặc **đấu giá thông thường**, không cài cả 2

## 7. Quy trình thanh toán sau đấu giá

Sau khi kết thúc phiên đấu giá, người bán và người mua khi truy cập vào chi tiết sản phẩm sẽ được dẫn sang view **Hoàn tất đơn hàng**, các người dùng khác thì chỉ thấy thông tin cơ bản của sản phẩm kèm thông báo **Sản phẩm đã kết thúc**

Quy trình **hoàn tất đơn hàng** gồm 4 bước

1. Người mua cung cấp hoá đơn thanh toán kèm địa chỉ giao hàng
2. Người bán xác nhận đã nhận tiền và gửi hoá đơn vận chuyển
3. Người mua xác nhận đã nhận hàng
4. Người mua và người bán đánh giá chất lượng giao dịch (+/- điểm kèm nhận xét ngắn)

Trong quá trình **hoàn tất đơn hàng**, người bán có thể **cancel giao dịch** bất kỳ lúc nào và đánh giá -1 cho người thắng cuộc. Ví dụ: người bán yêu cầu thanh toán trong vòng 24h sau khi kết thúc đấu giá, nhưng người mua không đáp ứng được, người bán huỷ giao dịch.

Giữa người bán và người thắng đấu giá luôn có một giao diện chat thân thiện để trao đổi các thông tin cần thiết trong quá trình **hoàn tất đơn hàng**.

Người bán và người mua luôn được phép thay đổi kết quả đánh giá (+/-) của mình cho phù hợp với mong muốn bản thân.

## 8. Các yêu cầu khác

### 8.1 Yêu cầu kỹ thuật

- Web App SSR (MVC) hoặc CSR (ReactJS) hoặc kết hợp
- Technical Stack SSR
  - framework: `expressjs`
  - view engine: `handlebars/ejs`
  - db: `mysql/postgres/mongodb`
- Technical Stack CSR
  - Backend: RESTful API (stack tương tự SSR)
  - Frontend: SPA ReactJS
- Chỉ hoàn thành **ĐÚNG** các chức năng được yêu cầu
  - Có thể bổ sung các hiệu ứng để tăng tính tiện dụng của từng chức năng cụ thể
- **KHÔNG YÊU CẦU** các chức năng realtime

### 8.2 Yêu cầu dữ liệu

- Cần có ít nhất 20 sản phẩm thuộc 4-5 danh mục, nội dung mô tả & hình ảnh đầy đủ.
  - Các sản phẩm phải có lịch sử đấu giá của ít nhất là 5 lượt ra giá

### 8.3 Yêu cầu quản lý mã nguồn

- Sinh viên cần upload mã nguồn lên **github** từ lúc bắt đầu thực hiện đồ án.
- Nhóm nào lịch sử commit/push gần như không có ➠ 0đ.
