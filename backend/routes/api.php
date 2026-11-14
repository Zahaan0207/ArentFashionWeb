<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SanPhamController;

// Khai báo trọn bộ API CRUD cho sản phẩm
Route::get('/san-phams', [SanPhamController::class, 'index']);
Route::post('/san-phams', [SanPhamController::class, 'store']);
Route::put('/san-phams/{id}', [SanPhamController::class, 'update']);
Route::delete('/san-phams/{id}', [SanPhamController::class, 'destroy']);