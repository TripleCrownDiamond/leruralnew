<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_subscriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('user_subscriptions', 'expiry_notice_sent_at')) {
                $table->timestamp('expiry_notice_sent_at')->nullable()->after('ends_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('user_subscriptions', 'expiry_notice_sent_at')) {
                $table->dropColumn('expiry_notice_sent_at');
            }
        });
    }
};
