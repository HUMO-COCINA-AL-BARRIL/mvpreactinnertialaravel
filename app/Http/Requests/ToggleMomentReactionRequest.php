<?php

namespace App\Http\Requests;

use App\Models\MomentReaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ToggleMomentReactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in([MomentReaction::TYPE_LIKE])],
        ];
    }
}
