# Mô tả các BLOCK

| Stt | Tên BLOCK| Mô tả  |
|-----|----------|--------|
|1| **Blank** | Là block thiết kế tự do |
|2| **Banner** | Dành cho thiết kế riêng cho banner|
|3| **Danh mục tự chọn** |Dành cho thiết kế danh mục, mặc định block này chỉ lấy dữ liệu của danh mục đã được chọn trong phần admin (vd: Danh mục bán chạy, nhóm hàng yêu thích...)|
|4| **Sản phẩm theo danh mục** | Dành cho thiết kế trang chi tiết danh mục, là trang hiển thị sản phẩm của danh mục được chọn, mặc định block này sẽ lấy dữ liệu theo router parman của danh mục được chọn và lấy dữ liệu sản phẩm tương ứng |
|5| **Chi tiết danh mục** | Dành cho thiết kế trang chi tiết danh mục, là trang hiển thị chi tiết danh mục (show những thông tin chi tiết của danh mục được chọn, vd: tên, mô tả, hình ảnh...), mặc định block này sẽ lấy dữ liệu theo router parman của danh mục được chọn. |
|6| **Sản phẩm tự chọn** | Dành cho thiết kế sản phẩm, mặc định block này chỉ lấy dữ liệu của sản phẩm đã được chọn trong phần admin (vd: sản phẩm hot, sản phẩm bán chạy, yêu thích...) |
|7| **Chi tiết sản phẩm** | Dành cho thiết kế trang chi tiết sản phẩm, là trang hiển thị chi tiết sản phẩm  (show những thông tin chi tiết của sản phẩm được chọn, vd: tên, mô tả, hình ảnh...), mặc định block này sẽ lấy dữ liệu theo router parman của sản phẩm được chọn. |
|8| **Tin tức tự chọn** | Dành cho thiết kế tin tức, mặc định block này chỉ lấy dữ liệu của tin tức đã được chọn trong phần admin (vd: Gốc tin tức, tin tức nổi bật...) |
|9| **Chi tiết tin tức** | Dành cho thiết kế trang chi tiết tin tức, là trang hiển thị chi tiết tin tức (show những thông tin chi tiết của tin tức được chọn, vd: tên, mô tả, hình ảnh...), mặc định block này sẽ lấy dữ liệu theo router parman của tin tức được chọn. |
|10| **Popup/ Hover** |  Block này thiết kế dành cho các dạng khi rê chuột vô show giao diện lên, click chuột hiển thị popup lên (vd: phần popup download của web Viethas, các menu ở phần header)|

# Cấu trúc router
Hiện tại cơ bản có 3 loại router:

> **http://localhost:4800**
- Mặc định sẽ là trang chủ, ở page này sẽ get **dữ liệu page** có type là "homepage"
- Dữ liệu của block thuộc trang chủ sẽ được get theo id_page của trang chủ vừa get về.

> **http://localhost:4800/ <span style="color:green">link_page</span>**
- **link_page** là phần router param được truyền từ các **object** có trường đường dẫn đã đc lưu, sẽ dựa vào **link_page** này get dữ liệu page về theo trương **link** của page
- Dữ liệu của block thuộc page này sẽ được get theo id_page của **dữ liệu page** vừa get về.

> **http://localhost:4800/ <span style="color:green">link_page</span>/ <span style="color:green">link_object</span>**
- **link_object** là phần router param được truyền từ các **object** có dữ liệu (sản phẩm, tin tức, danh mục), sẽ dựa vào **link_object** này get dữ liệu chi tiết của **object** đó về theo trương **link** của object.
- Trường hợp **link_object** là danh mục và page có block là **Sản phẩm theo danh mục**, thì block này sẽ get dữ liệu danh mục dựa vào **link_object** và get dữ liệu sản phẩm theo id_category(dữ liệu danh mục đã được get về theo **link_object**).
- Dữ liệu của block thuộc page này sẽ được get theo id_page của **dữ liệu page** vừa get về.
