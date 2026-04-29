<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promo_codes', function (Blueprint $table): void {
            if (!Schema::hasColumn('promo_codes', 'applies_to_all_subscriptions')) {
                $table->boolean('applies_to_all_subscriptions')->default(true)->after('is_featured');
            }

            if (!Schema::hasColumn('promo_codes', 'subscription_plan_ids')) {
                $table->json('subscription_plan_ids')->nullable()->after('applies_to_all_subscriptions');
            }
        });
    }

    public function down(): void
    {
        Schema::table('promo_codes', function (Blueprint $table): void {
            if (Schema::hasColumn('promo_codes', 'subscription_plan_ids')) {
                $table->dropColumn('subscription_plan_ids');
            }

            if (Schema::hasColumn('promo_codes', 'applies_to_all_subscriptions')) {
                $table->dropColumn('applies_to_all_subscriptions');
            }
        });
    }
};
