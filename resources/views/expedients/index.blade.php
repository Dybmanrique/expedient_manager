{{-- <x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    
</x-app-layout> --}}

@extends('layouts.app')

@section('header')
    <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
        {{ __('Dashboard') }}
    </h2>
@endsection

@section('content')
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="flex justify-between mb-4">
                        <h2>Catálogo de Expedientes</h2>
                        <a class="rounded bg-blue-800 p-2" href="{{ route('expedients.create') }}">Registrar expediente</a>
                    </div>

                    <button onclick="exportToExcel()" class="rounded p-2 bg-blue-500">Exportar a Excel</button>
                    {{-- <button onclick="printData()">Imprimir</button> --}}

                    <button onclick="resetFilters()" class="rounded p-2 bg-gray-500">Limpiar filtros</button>

                    </div>
                    <div id="myGrid" class="p-6" style="height: 500px"></div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('styles')
    <link rel="stylesheet" href="{{asset('css/expedients/style.css')}}">
@endpush

@push('scripts')
<script src="https://printjs-4de6.kxcdn.com/print.min.js"></script>
<link rel="stylesheet" href="https://printjs-4de6.kxcdn.com/print.min.css">

    <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
    <script src="{{asset('js/expedients/traslate_ag_grid.js')}}"></script>
    <script src="{{asset('js/expedients/index.js')}}"></script>
@endpush
