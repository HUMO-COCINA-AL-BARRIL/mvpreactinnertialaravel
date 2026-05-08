<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\MenuController;
use App\Http\Controllers\Public\LandingController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\ReservationController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminDeliveryFeeController;
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
Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

Route::get('/reservation', [ReservationController::class, 'create'])->name('reservation.create');
Route::post('/reservation', [ReservationController::class, 'store'])->name('reservation.store');
Route::get('/reservation/thanks', [ReservationController::class, 'thanks'])->name('reservation.thanks');

Route::get('/dashboard', [AdminDashboardController::class, '__invoke'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::resource('admin/products', AdminProductController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('admin.products');
    Route::resource('admin/categories', AdminCategoryController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('admin.categories');
    Route::resource('admin/delivery-fees', AdminDeliveryFeeController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('admin.delivery-fees');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
