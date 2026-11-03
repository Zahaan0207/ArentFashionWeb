<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ĐÂY LÀ CODE CÓ SẴN CỦA LARAVEL (Bạn cứ giữ nguyên)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ĐÂY LÀ CODE BẠN THÊM VÀO ĐỂ TEST
Route::get('/test', function () {
    return response()->json(['message' => 'Backend Laravel đã kết nối thành công!']);
});