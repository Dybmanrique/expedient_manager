<?php

namespace App\Http\Controllers;

use App\Models\Expedient;
use Illuminate\Http\Request;

class ExpedientController extends Controller
{
    public function index()
    {
        return view('expedients.index');
    }

    public function data(){
        $expedients = Expedient::all();
        return $expedients;
    }

    public function download(Request $request)
    {
        $expedient = Expedient::where('uuid', $request->uuid)->first();

        $ruta = '\\\\Deyber\\Ingresos\\' . $expedient->path;
        
        clearstatcache(true, $ruta);
        
        if (!file_exists($ruta)) {
            abort(404);
        }
        
        return response()->file($ruta, [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    public function create()
    {
        return view('expedients.create');
    }
}
