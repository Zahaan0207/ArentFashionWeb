<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SanPham;
use Illuminate\Http\Request;

class SanPhamController extends Controller
{
    // 1. Lấy danh sách toàn bộ sản phẩm
    public function index()
    {
        return response()->json(SanPham::all(), 200);
    }

    // 2. Thêm mới sản phẩm (có validate)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'     => ['required', 'regex:/^[A-Z]{2}[0-9]{3}$/', 'unique:san_phams,code'],
            'name'     => 'required|string|max:255',
            'category' => 'required|string',
            'price'    => 'required|numeric|gt:200000', // Giá > 200.000 ₫
            'quantity' => 'required|integer|min:0',  // Số lượng từ 0 trở lên
        ]);

        $validated['status'] = $validated['quantity'] > 0 ? 'Còn hàng' : 'Hết hàng';
        $sanPham = SanPham::create($validated);

        return response()->json([
            'message' => 'Thêm sản phẩm thành công!',
            'data'    => $sanPham
        ], 201);
    }

    // 3. Cập nhật thông tin sản phẩm
    public function update(Request $request, $id)
    {
        $sanPham = SanPham::findOrFail($id);

        $validated = $request->validate([
            'code'     => ['required', 'regex:/^[A-Z]{2}[0-9]{3}$/', 'unique:san_phams,code,' . $id],
            'name'     => 'required|string|max:255',
            'category' => 'required|string',
            'price'    => 'required|numeric|gt:200000',
            'quantity' => 'required|integer|min:0',
        ]);

        $validated['status'] = $validated['quantity'] > 0 ? 'Còn hàng' : 'Hết hàng';
        $sanPham->update($validated);

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công!',
            'data'    => $sanPham
        ], 200);
    }

    // 4. Xóa sản phẩm
    public function destroy($id)
    {
        $sanPham = SanPham::findOrFail($id);
        $sanPham->delete();

        return response()->json([
            'message' => 'Đã xóa sản phẩm thành công!'
        ], 200);
    }
}