Hãy làm theo quy tắc bắt buộc bên dưới cho dự án ReactJS vite
-Nơi đặt file:
-Đối với những component mang tính tái sử dụng nhiều lần đặt vào đặt vào đúng với folder đang code ví dụ cho note thì bỏ vào folder note nếu chưa có thì tạo mới folder : webapp/src/components
-Đối với hook thì đặt vào webapp/src/hooks đặt vào folder với chức năng đang code nếu chưa có thì tạo mới
-Đối với tsx những file này sẽ chỉ được chứa UI không được có các hook của react bên trong sẽ đặt vào webapp/src/pages :
Quy ước đặt tên đối với file nào là screen thì nó là những file nhỏ bên trong file nào được khai báo ở App.tsx sẽ đặt tên là page. Tuyệt đối không dùng các phương pháp css như dangerousHTML mà phải dùng tailwind 100% và chỉ được chứa code tsx không chứa hook
-Đối với service call API ở back-end thì sẽ đặt ở webapp/src/services nếu service cho chức năng đso chưa tồn tại thì sẽ tạo mới còn có rồi thì chỉ cần viết thêm phương thức vào. Sử dụng class
-Sử dụng redux để quản lí dữ liệu webapp/src/store
-Các type interface enum .... phải được khai báo bên trong này file /src/types phải tạo folder cho chức năng đang code cho giống format đang làm
-Không làm xong không được phép run các lệnh npm start run dev để chạy dự án
-Không được tạo file md để tóm tắt sau khi đã làm xong
