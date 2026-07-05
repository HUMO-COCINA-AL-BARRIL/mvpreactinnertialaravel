<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminCustomizationController extends Controller
{
    public function index(): Response
    {
        $settings = BusinessSetting::current();

        return Inertia::render('Admin/Customization/Wizard', [
            'customization' => [
                'businessName' => $settings->business_name,
                'closedMessage' => $settings->closed_message,
                'heroBadge' => $settings->hero_badge,
                'heroTitle' => $settings->hero_title,
                'heroDescription' => $settings->hero_description,
                'featuredCategoriesTitle' => $settings->featured_categories_title,
                'featuredProductsTitle' => $settings->featured_products_title,
                'ctaTitle' => $settings->cta_title,
                'ctaDescription' => $settings->cta_description,
                'navbarBackgroundColor' => $settings->navbar_background_color,
                'navbarTextColor' => $settings->navbar_text_color,
                'primaryButtonColor' => $settings->primary_button_color,
                'primaryButtonTextColor' => $settings->primary_button_text_color,
                'sectionBackgroundColor' => $settings->section_background_color,
                'sectionSurfaceColor' => $settings->section_surface_color,
                'ctaBackgroundColor' => $settings->cta_background_color,
                'logoUrl' => $settings->logo_path ? Storage::url($settings->logo_path) : null,
                'heroImageUrl' => $settings->hero_image_path ? Storage::url($settings->hero_image_path) : null,
                'setupCompleted' => (bool) $settings->setup_completed_at,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $settings = BusinessSetting::current();
        $wasSetupCompleted = (bool) $settings->setup_completed_at;
        $isCompletingSetup = $request->boolean('complete_setup');
        $isSilentSave = $request->boolean('silent_save');

        $data = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'closed_message' => ['nullable', 'string', 'max:255'],
            'hero_badge' => ['nullable', 'string', 'max:255'],
            'hero_title' => ['required', 'string', 'max:255'],
            'hero_description' => ['nullable', 'string', 'max:1200'],
            'featured_categories_title' => ['required', 'string', 'max:255'],
            'featured_products_title' => ['required', 'string', 'max:255'],
            'cta_title' => ['required', 'string', 'max:255'],
            'cta_description' => ['nullable', 'string', 'max:1200'],
            'navbar_background_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'navbar_text_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'primary_button_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'primary_button_text_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'section_background_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'section_surface_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'cta_background_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'logo' => ['nullable', 'image', 'max:4096'],
            'hero_image' => ['nullable', 'image', 'max:6144'],
            'remove_logo' => ['nullable', 'boolean'],
            'remove_hero_image' => ['nullable', 'boolean'],
            'complete_setup' => ['nullable', 'boolean'],
            'silent_save' => ['nullable', 'boolean'],
        ]);

        if ($request->boolean('remove_logo') && $settings->logo_path) {
            Storage::disk('public')->delete($settings->logo_path);
            $data['logo_path'] = null;
        }

        if ($request->boolean('remove_hero_image') && $settings->hero_image_path) {
            Storage::disk('public')->delete($settings->hero_image_path);
            $data['hero_image_path'] = null;
        }

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }

            $data['logo_path'] = $request->file('logo')->store('branding', 'public');
        }

        if ($request->hasFile('hero_image')) {
            if ($settings->hero_image_path) {
                Storage::disk('public')->delete($settings->hero_image_path);
            }

            $data['hero_image_path'] = $request->file('hero_image')->store('branding', 'public');
        }

        unset($data['logo'], $data['hero_image'], $data['remove_logo'], $data['remove_hero_image'], $data['complete_setup'], $data['silent_save']);

        $data['setup_completed_at'] = $isCompletingSetup
            ? ($settings->setup_completed_at ?? now())
            : $settings->setup_completed_at;

        $settings->update($data);

        if ($isSilentSave) {
            return back();
        }

        if (! $isCompletingSetup) {
            return back()->with('success', 'Personalizacion guardada como borrador.');
        }

        $settings->refresh();

        return redirect()
            ->route('dashboard')
            ->with('success', $wasSetupCompleted ? 'Personalizacion actualizada correctamente.' : 'Configuracion inicial completada correctamente.');
    }
}
