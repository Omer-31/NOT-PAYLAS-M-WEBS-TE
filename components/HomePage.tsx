/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { BookOpenIcon, UsersIcon, DownloadIcon, ChatAltIcon, ArrowRightIcon, AcademicCapIcon, PuzzleIcon, ChartBarIcon, StarIcon } from './icons';
import { Page } from '../App';

const StatCard: React.FC<{ icon: React.ElementType, value: string, label: string }> = ({ icon: Icon, value, label }) => (
    <div className="flex items-center p-4">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/10 mr-4">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
);


const FeatureCard: React.FC<{ icon: React.ElementType, title: string, description: string, color: string }> = ({ icon: Icon, title, description, color }) => (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
        <div className={`mb-4 inline-block p-3 rounded-lg bg-${color}-100 dark:bg-${color}-500/10`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
    </div>
);

interface HomePageProps {
    setActivePage: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setActivePage }) => {
    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center py-16 px-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
                <AcademicCapIcon className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                    Erciyes Üniversitesi
                </h1>
                <h2 className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                    Not Paylaşım Platformu
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Öğrenciler için öğrenciler tarafından oluşturulan not paylaşım sistemi. Ders notlarınızı paylaşın, yorum yapın, tartışın ve birlikte öğrenin.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={() => setActivePage('Ders Notları')} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md">
                        Notlara Göz At <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </button>
                    <button onClick={() => setActivePage('Not Yükle')} className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        Not Yükle
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                <StatCard icon={BookOpenIcon} value="2,847" label="Toplam Not" />
                <StatCard icon={UsersIcon} value="1,293" label="Aktif Öğrenci" />
                <StatCard icon={DownloadIcon} value="45,729" label="İndirme Sayısı" />
                <StatCard icon={ChatAltIcon} value="8,651" label="Yorum" />
            </div>

            {/* Features Section */}
            <div>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Neden ERÜ Not Paylaşım?</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Öğrenci odaklı tasarımımız ile akademik başarınızı destekliyoruz</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard
                        icon={BookOpenIcon}
                        title="Ders Notları"
                        description="Bölümünüze özel ders notlarına kolayca erişin ve paylaşın"
                        color="blue"
                    />
                    <FeatureCard
                        icon={UsersIcon}
                        title="Sınıf Grupları"
                        description="Sınıf arkadaşlarınızla tartışın ve deneyimlerinizi paylaşın"
                        color="green"
                    />
                    <FeatureCard
                        icon={ChartBarIcon}
                        title="İstatistikler"
                        description="En popüler notları keşfedin ve trendleri takip edin"
                        color="purple"
                    />
                    <FeatureCard
                        icon={StarIcon}
                        title="Puan Sistemi"
                        description="Not paylaşarak ve yorum yaparak puan kazanın, rozet toplayın"
                        color="orange"
                    />
                </div>
            </div>
             <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                Made in Bolt
            </footer>
        </div>
    );
};

export default HomePage;