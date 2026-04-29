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
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'description')) {
                $table->string('description')->nullable()->after('status');
            }

            if (!Schema::hasColumn('payments', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('description');
            }

            if (!Schema::hasColumn('payments', 'receipt_image')) {
                $table->string('receipt_image')->nullable()->after('paid_at');
            }

            if (!Schema::hasColumn('payments', 'phone_number')) {
                $table->string('phone_number')->nullable()->after('receipt_image');
            }

            if (!Schema::hasColumn('payments', 'provider')) {
                $table->string('provider')->nullable()->after('phone_number');
            }

            if (!Schema::hasColumn('payments', 'reference')) {
                $table->string('reference')->nullable()->after('provider');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $columns = ['description', 'paid_at', 'receipt_image', 'phone_number', 'provider', 'reference'];

            $existingColumns = array_values(array_filter($columns, fn (string $column) => Schema::hasColumn('payments', $column)));
            if (!empty($existingColumns)) {
                $table->dropColumn($existingColumns);
            }
        });
    }
};
