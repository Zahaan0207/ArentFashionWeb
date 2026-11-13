<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('san_phams', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Mã sản phẩm (VD: DR001)
            $table->string('name');           // Tên trang phục
            $table->string('category');       // Thể loại
            $table->decimal('price', 12, 2);  // Giá sản phẩm
            $table->integer('quantity');      // Số lượng
            $table->string('status');         // Trạng thái (Còn hàng / Hết hàng)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('san_phams');
    }
};
