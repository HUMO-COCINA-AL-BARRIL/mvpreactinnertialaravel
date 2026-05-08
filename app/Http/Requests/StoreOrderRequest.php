<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'delivery_method' => ['required', 'in:pickup,dine_in,delivery'],
            'delivery_address' => ['nullable', 'string', 'max:255'],
            'delivery_fee_id' => ['nullable', 'exists:delivery_fees,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', 'in:online,cash_on_delivery,on_site'],
            'payment_provider' => ['nullable', 'in:wompi,mercadopago,payu'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('payment_provider') === '') {
            $this->merge(['payment_provider' => null]);
        }

        if ($this->input('delivery_method') !== 'delivery') {
            $this->merge([
                'delivery_address' => null,
                'delivery_fee_id' => null,
            ]);
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->input('delivery_method') === 'delivery' && ! $this->input('delivery_fee_id')) {
                $validator->errors()->add('delivery_fee_id', 'Selecciona una tarifa de domicilio.');
            }
        });
    }
}
