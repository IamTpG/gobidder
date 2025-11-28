import { useProductList } from "./useProductList";

//Hook để lấy danh sách sản phẩm của seller đang đăng nhập
export const useMyProducts = () => {
  return useProductList({
    endpoint: "/users/me/products",
    enableStatusFilter: true,
    preserveOtherParams: true,
  });
};
