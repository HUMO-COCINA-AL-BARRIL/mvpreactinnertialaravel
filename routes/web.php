<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\MenuController;
use App\Http\Controllers\Public\MomentController;
use App\Http\Controllers\Public\MomentCommentController;
use App\Http\Controllers\Public\MomentReactionController;
use App\Http\Controllers\Public\OrderTrackingController;
use App\Http\Controllers\Public\MomentFeedController;
use App\Http\Controllers\Public\MomentShareController;
use App\Http\Controllers\Public\LandingController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\ReservationController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminBusinessStatusController;
use App\Http\Controllers\Admin\AdminCustomizationController;
use App\Http\Controllers\Admin\AdminDeliveryFeeController;
use App\Http\Controllers\Admin\AdminMomentController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminReservationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', LandingController::class)->name('landing');

Route::get('/menu', MenuController::class)->name('menu.index');
Route::get('/feed', MomentFeedController::class)->name('feed.index');
Route::get('/pedido/seguimiento', OrderTrackingController::class)->name('orders.tracking');
Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::post('/moments', [MomentController::class, 'store'])->name('moments.store');
Route::get('/momentos/{moment}', MomentShareController::class)->name('moments.show');
Route::post('/moments/{moment}/comments', [MomentCommentController::class, 'store'])->name('moments.comments.store');
Route::post('/moments/{moment}/reactions', MomentReactionController::class)->name('moments.reactions.toggle');

Route::get('/reservation', [ReservationController::class, 'create'])->name('reservation.create');
Route::get('/reservation/availability', [ReservationController::class, 'availability'])->name('reservation.availability');
Route::post('/reservation', [ReservationController::class, 'store'])->name('reservation.store');
Route::get('/reservation/thanks', [ReservationController::class, 'thanks'])->name('reservation.thanks');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('admin/customization', [AdminCustomizationController::class, 'index'])
        ->name('admin.customization.index');
    Route::match(['put', 'post'], 'admin/customization', [AdminCustomizationController::class, 'update'])
        ->name('admin.customization.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'admin', 'customization.complete'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, '__invoke'])
        ->name('dashboard');
    Route::patch('admin/business-status', [AdminBusinessStatusController::class, 'update'])
        ->name('admin.business-status.update');
    Route::resource('admin/products', AdminProductController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('admin.products');
    Route::resource('admin/categories', AdminCategoryController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('admin.categories');
    Route::resource('admin/delivery-fees', AdminDeliveryFeeController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('admin.delivery-fees');
    Route::get('admin/orders/rt', [AdminOrderController::class, 'snapshot'])
        ->name('admin.orders.snapshot');
    Route::resource('admin/orders', AdminOrderController::class)
        ->only(['index', 'update'])
        ->names('admin.orders');
    Route::resource('admin/reservations', AdminReservationController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('admin.reservations');
    Route::resource('admin/moments', AdminMomentController::class)
        ->only(['index', 'destroy'])
        ->names('admin.moments');
    Route::get('admin/reservations/availability', [AdminReservationController::class, 'availability'])
        ->name('admin.reservations.availability');
    Route::patch('admin/reservations/settings', [AdminReservationController::class, 'updateSettings'])
        ->name('admin.reservations.settings.update');
});

require __DIR__.'/auth.php';
