<?php

namespace App\Http\Controllers;

use App\Models\Expedient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class ExpedientController extends Controller
{
    public function index()
    {
        return view('expedients.index');
    }

    public function data()
    {
        $expedients = Expedient::orderBy('created_at', 'desc')->get();
        return $expedients;
    }

    public function download(Request $request)
    {
        $expedient = Expedient::where('uuid', $request->uuid)->first();

        $ruta = '\\\\desktop-9iqo8pm\\expedientes\\' . $expedient->path;

        clearstatcache(true, $ruta);

        if (!file_exists($ruta)) {
            abort(404);
        }

        return response()->file($ruta, [
            'Content-Disposition' => 'inline; filename="' . $expedient->name . '"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    public function create()
    {
        return view('expedients.create');
    }

    public function delete(Request $request)
{
    $request->validate([
        'id' => 'required|exists:expedients,id',
    ]);

    try {
        $expedient = Expedient::findOrFail($request->id);

        // Eliminar archivo de red si existe
        $sharedPath = '\\\\desktop-9iqo8pm\\expedientes\\' . $expedient->path;
        if (File::exists($sharedPath)) {
            File::delete($sharedPath);
        }

        $expedient->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expediente eliminado correctamente.',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al eliminar el expediente.',
        ], 500);
    }
}
}
