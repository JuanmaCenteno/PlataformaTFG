<?php
// src/Service/FileConfigService.php

namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class FileConfigService
{
    private array $allowedMimeTypes;
    private array $allowedExtensions;

    public function __construct(
        private ParameterBagInterface $params
    ) {
        $this->allowedMimeTypes = explode(',', $this->params->get('allowed_mime_types'));
        $this->allowedExtensions = explode(',', $this->params->get('allowed_file_extensions'));
    }

    public function getMaxFileSize(): int
    {
        return (int) $this->params->get('max_file_size');
    }

    public function getMaxFileSizeFormatted(): string
    {
        $bytes = $this->getMaxFileSize();
        $units = ['B', 'KB', 'MB', 'GB'];
        $unit = 0;

        while ($bytes >= 1024 && $unit < count($units) - 1) {
            $bytes /= 1024;
            $unit++;
        }

        return round($bytes, 1) . ' ' . $units[$unit];
    }

    public function getAllowedMimeTypes(): array
    {
        return $this->allowedMimeTypes;
    }

    public function getAllowedExtensions(): array
    {
        return $this->allowedExtensions;
    }

    public function isVirusScanEnabled(): bool
    {
        return (bool) $this->params->get('file_virus_scan_enabled');
    }

    public function getCleanupDays(): int
    {
        return (int) $this->params->get('file_cleanup_old_files_days');
    }

    public function isFileLoggingEnabled(): bool
    {
        return (bool) $this->params->get('log_file_operations');
    }

    public function getTempDirectory(): string
    {
        return $this->params->get('file_upload_temp_dir');
    }

    public function getUploadsDirectory(): string
    {
        return $this->params->get('uploads_directory');
    }

    public function isValidMimeType(string $mimeType): bool
    {
        return in_array($mimeType, $this->allowedMimeTypes, true);
    }

    public function isValidExtension(string $extension): bool
    {
        return in_array(strtolower($extension), $this->allowedExtensions, true);
    }

    public function isValidFileSize(int $size): bool
    {
        return $size <= $this->getMaxFileSize() && $size > 0;
    }
}