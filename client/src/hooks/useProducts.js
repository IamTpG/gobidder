import { useProductList } from "./useProductList";

//Hook để lấy danh sách tất cả sản phẩm (public)
export const useProducts = () => {
  return useProductList({
    endpoint: "/products",
    enableStatusFilter: false,
    preserveOtherParams: false,
  });
};
