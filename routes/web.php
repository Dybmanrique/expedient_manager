<?php

use App\Http\Controllers\ExpedientController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Route::get('/dashboard', function () {
//     return view('dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/dashboard', [ExpedientController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
Route::get('/dashboard/data', [ExpedientController::class, 'data'])->middleware(['auth', 'verified'])->name('expedients.data');
Route::get('/expedientes/descargar', [ExpedientController::class, 'download'])->middleware(['auth', 'verified'])->name('expedients.download');
Route::get('/expedientes/registrar', [ExpedientController::class, 'create'])->middleware(['auth', 'verified'])->name('expedients.create');

require __DIR__.'/auth.php';
