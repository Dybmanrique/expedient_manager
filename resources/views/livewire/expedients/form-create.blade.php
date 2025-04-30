<div>
    <form wire:submit='save'>
        <div>
            <label for="">N° expediente</label>
            <input type="text" wire:model='expedient_number'>
            @error('expedient_number')
                <span class="text-red-500">{{ $message }}</span>
            @enderror
        </div>
        <div>
            <label for="">Nombre</label>
            <input type="text" wire:model='name'>
            @error('expedient_number')
                <span class="text-red-500">{{ $message }}</span>
            @enderror
        </div>
        <div>
            <label for="">Estado</label>
            <select name="" id="" wire:model='state'>
                <option value="en proceso">En Proceso</option>
                <option value="aprobado">Aprobado</option>
                <option value="anulado">Anulado</option>
                <option value="archivado">Archivado</option>
            </select>
            @error('expedient_number')
                <span class="text-red-500">{{ $message }}</span>
            @enderror
        </div>
        <div>
            <label for="">Archivo</label>
            <input type="file" wire:model='file'>
            @error('expedient_number')
                <span class="text-red-500">{{ $message }}</span>
            @enderror
        </div>

        <button type="submit">Guardar</button>
    </form>
</div>
