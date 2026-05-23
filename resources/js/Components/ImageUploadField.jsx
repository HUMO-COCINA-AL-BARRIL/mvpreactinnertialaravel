import { ImagePlus, Upload, X } from 'lucide-react';

export default function ImageUploadField({
    label = 'Imagen',
    preview = null,
    fileName = null,
    error = null,
    helpText = 'Formatos sugeridos: JPG, PNG o WEBP.',
    emptyText = 'Aun no has seleccionado una imagen.',
    currentText = 'Usando imagen actual.',
    onFileChange,
    onClear,
}) {
    return (
        <div>
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <div className="mt-2 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-4">
                <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
                    <div className="flex justify-center lg:justify-start">
                        {preview ? (
                            <div className="relative h-40 w-full max-w-[220px] overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm">
                                <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="flex h-40 w-full max-w-[220px] flex-col items-center justify-center rounded-[1.25rem] border border-slate-200 bg-white text-slate-400 shadow-sm">
                                <ImagePlus className="h-9 w-9" />
                                <p className="mt-3 text-sm font-medium">Sin vista previa</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Sube una imagen</p>
                            <p className="mt-1 text-sm text-slate-500">{helpText}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                                <Upload className="h-4 w-4" />
                                {preview ? 'Reemplazar imagen' : 'Seleccionar imagen'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
                                />
                            </label>

                            {(preview || fileName) && (
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                    onClick={onClear}
                                >
                                    <X className="h-4 w-4" />
                                    Quitar
                                </button>
                            )}
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                            {fileName ? fileName : preview ? currentText : emptyText}
                        </div>
                    </div>
                </div>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
