<?php

namespace App\Livewire\Expedients;

use App\Models\Expedient;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithFileUploads;

class FormCreate extends Component
{
    use WithFileUploads;

    public $expedient_number, $name, $state, $file;

    public function updatedFile()
    {
        $filename = $this->file->getClientOriginalName();
        $filename_without_extension = pathinfo($filename, PATHINFO_FILENAME);

        $this->expedient_number = $filename_without_extension;
        $this->name = $filename;
    }

    public function save()
    {
        $this->validate([
            'expedient_number' => 'required|unique:expedients,expedient_number',
            'name' => 'required|string',
            'state' => 'required|in:en proceso,aprobado,anulado,archivado',
            'file' => 'required|file|max:10240', // máximo 10MB
        ]);

        // Definir ruta de red compartida
        $sharedPath = '\\\\desktop-9iqo8pm\\expedientes\\';

        // Asegurarse de que existe
        if (!File::exists($sharedPath)) {
            return session()->flash('message', 'La ruta compartida no está disponible.');
        }

        // Obtener nombre original y construir nombre único
        $originalName = $this->file->getClientOriginalName();
        $filename = now()->format('YmdHis') . '_' . Str::random(6) . '_' . $originalName;

        // Guardar temporalmente el archivo en /tmp y luego moverlo
        $tmpPath = $this->file->storeAs('tmp', $filename);

        // Ruta completa hacia la red
        $fullDestinationPath = $sharedPath . $filename;

        // Copiar archivo
        File::copy(storage_path('app/private/' . $tmpPath), $fullDestinationPath);

        // Guardar en la base de datos
        Expedient::create([
            'expedient_number' => $this->expedient_number,
            'name' => $this->name,
            'state' => $this->state,
            'path' => $filename,
            'uuid' => Str::uuid(),
            'user_id' => auth()->user()->id
        ]);

        session()->flash('message', 'Expediente guardado correctamente.');

        $this->reset(['expedient_number', 'name', 'state', 'file']);
    }


    public function render()
    {
        return view('livewire.expedients.form-create');
    }
}
