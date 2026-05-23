<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:pending,confirmed,preparing,ready,delivered,cancelled'],
            'payment_status' => ['nullable', 'in:pending,paid,failed,cancelled'],
            'cancellation_reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->input('status') === 'cancelled' && ! filled($this->input('cancellation_reason'))) {
                $validator->errors()->add('cancellation_reason', 'Debes indicar un motivo de cancelacion.');
            }
        });
    }
}
