/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DocumentTextIcon } from './icons';
import { renderAsync } from 'docx-preview';

interface FilePreviewProps {
    fileUrl: string;
    fileType: string; // MIME type (e.g., application/pdf, image/png, application/vnd.openxmlformats-officedocument.wordprocessingml.document)
    fileName: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ fileUrl, fileType, fileName }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [docxError, setDocxError] = useState<string | null>(null);
    const [imgError, setImgError] = useState<boolean>(false);

    // Infer by MIME and extension as fallback
    const { isPdf, isImage, isDocx } = useMemo(() => {
        const lowerName = fileName.toLowerCase();
        const mime = (fileType || '').toLowerCase();
        const ext = lowerName.split('.').pop() || '';
        const image = mime.startsWith('image/') || ['png','jpg','jpeg','webp','gif'].includes(ext);
        const pdf = mime.includes('pdf') || ext === 'pdf';
        const docx = mime.includes('word') || mime.includes('officedocument.wordprocessingml') || ['doc','docx'].includes(ext);
        return { isPdf: pdf, isImage: image, isDocx: docx };
    }, [fileType, fileName]);

    useEffect(() => {
        let cancelled = false;
        setDocxError(null);
        if (isDocx && containerRef.current) {
            (async () => {
                try {
                    const res = await fetch(fileUrl);
                    const buf = await res.arrayBuffer();
                    if (cancelled) return;
                    // Clean previous content
                    containerRef.current!.innerHTML = '';
                    await renderAsync(new Uint8Array(buf), containerRef.current!, undefined, {
                        inWrapper: true,
                        ignoreWidth: true,
                        ignoreHeight: true,
                        breakPages: false,
                        useBase64URL: true,
                        useMathMLPolyfill: true
                    });
                } catch (e: any) {
                    if (!cancelled) setDocxError('Word önizlemesi oluşturulamadı.');
                }
            })();
        }
        return () => {
            cancelled = true;
        };
    }, [isDocx, fileUrl]);

    const renderPreview = () => {
        if (isPdf) {
            return (
                <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=0`}
                    title={fileName}
                    className="w-full h-full border-0"
                    aria-label={`${fileName} PDF preview`}
                />
            );
        }
        if (isImage) {
            return (
                <img
                    src={fileUrl}
                    alt={`${fileName} preview`}
                    className="max-w-full max-h-full object-contain"
                    onError={() => setImgError(true)}
                />
            );
        }
        if (isDocx) {
            return (
                <div className="w-full h-full overflow-auto" ref={containerRef}>
                    {docxError && (
                        <div className="text-center text-red-500 text-sm p-4">{docxError}</div>
                    )}
                </div>
            );
        }
        if (imgError) {
            return (
                <div className="text-center text-gray-500 dark:text-gray-400 p-6">
                    <p>Resim önizlemesi yüklenemedi.</p>
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Dosyayı yeni sekmede aç</a>
                </div>
            );
        }
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 p-8 flex flex-col items-center justify-center">
                <DocumentTextIcon className="h-20 w-20 text-gray-400 mb-4" />
                <p className="font-semibold text-lg">Önizleme desteklenmiyor</p>
                <p className="text-sm mt-1">Dosya Adı: {fileName}</p>
                <p className="text-xs mt-1">Bu dosya türü için bir önizleme mevcut değil, ancak dosyayı indirebilirsiniz.</p>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
            {renderPreview()}
        </div>
    );
};

export default FilePreview;
