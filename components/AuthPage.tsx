/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FACULTIES, CLASS_YEARS } from '../data/university';
import { LogoIcon, AcademicCapIcon } from './icons';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login, register } = useAuth();

  // Common State
  const [error, setError] = useState<string | null>(null);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFaculty, setRegFaculty] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regClassYear, setRegClassYear] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (loginEmail && loginPassword) {
      try {
        await login(loginEmail, loginPassword);
      } catch (err: any) {
        setError(err.message || "Giriş yaparken bir hata oluştu.");
      }
    } else {
      setError("Lütfen tüm alanları doldurun.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (regFirstName && regLastName && regStudentId && regPassword && regFaculty && regDepartment && regClassYear && consentChecked) {
      try {
        const email = `${regStudentId}@erciyes.edu.tr`;
        await register({
            firstName: regFirstName,
            lastName: regLastName,
            faculty: regFaculty,
            department: regDepartment,
            classYear: regClassYear
        }, email, regPassword);
      } catch (err: any) {
        setError(err.message || "Kayıt olurken bir hata oluştu.");
      }
    } else {
      setError("Lütfen tüm alanları doldurun ve aydınlatma metnini onaylayın.");
    }
  };
  
  const switchView = (isLogin: boolean) => {
    setIsLoginView(isLogin);
    setError(null); // Clear errors when switching views
  };

  const commonInputClass = "w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const commonButtonClass = "w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  const ErrorDisplay = ({ message }: { message: string | null }) => message ? <p className="text-red-500 text-sm text-center my-4">{message}</p> : null;


  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700/50">
            <div className="text-center mb-8">
                <AcademicCapIcon className="h-14 w-14 mx-auto text-blue-500 mb-3" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ERÜ Not Paylaşım Platformu
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Öğrenci Hesabınıza Giriş Yapın</p>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                    onClick={() => switchView(true)}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${isLoginView ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Giriş Yap
                </button>
                <button 
                    onClick={() => switchView(false)}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${!isLoginView ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Kayıt Ol
                </button>
            </div>
            
            {isLoginView ? (
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="login-email">Öğrenci E-postası</label>
                        <input id="login-email" type="email" placeholder="1020301265@erciyes.edu.tr" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={commonInputClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="login-password">Şifre</label>
                        <input id="login-password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={commonInputClass} required />
                    </div>
                    <ErrorDisplay message={error} />
                    <button type="submit" className={commonButtonClass}>Giriş Yap</button>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="flex gap-4">
                         <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="reg-fname">İsim</label>
                            <input id="reg-fname" type="text" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} className={commonInputClass} required />
                        </div>
                         <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="reg-lname">Soyisim</label>
                            <input id="reg-lname" type="text" value={regLastName} onChange={e => setRegLastName(e.target.value)} className={commonInputClass} required />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="reg-id">Öğrenci Numarası</label>
                        <div className="flex items-center">
                            <input id="reg-id" type="text" pattern="\d*" placeholder="1020301265" value={regStudentId} onChange={e => setRegStudentId(e.target.value)} className={commonInputClass} required />
                            <span className="ml-2 text-gray-500 dark:text-gray-400">@erciyes.edu.tr</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="reg-password">Şifre</label>
                        <input id="reg-password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className={commonInputClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="reg-faculty">Fakülte</label>
                        <select id="reg-faculty" value={regFaculty} onChange={e => { setRegFaculty(e.target.value); setRegDepartment(''); }} className={commonInputClass} required>
                            <option value="" disabled>Fakülte Seçin</option>
                            {FACULTIES.map(f => (
                              <option key={f.name} value={f.name}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="reg-department">Bölüm</label>
                        <select id="reg-department" value={regDepartment} onChange={e => setRegDepartment(e.target.value)} className={commonInputClass} required>
                            <option value="" disabled>Bölüm Seçin</option>
                            {FACULTIES.find(f => f.name === regFaculty)?.departments.map(d => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="reg-class">Sınıf</label>
                        <select id="reg-class" value={regClassYear} onChange={e => setRegClassYear(e.target.value)} className={commonInputClass} required>
                            <option value="" disabled>Sınıf Seçin</option>
                            {CLASS_YEARS.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/40 text-xs text-gray-600 dark:text-gray-300">
                      <p className="font-semibold mb-1">Aydınlatma Metni</p>
                      <p>Erciyes Üniversitesi Not Paylaşım Platformu kapsamında paylaştığınız kişisel verileriniz (isim, e-posta, fakülte, bölüm, sınıf, içerik ve kullanım verileri) KVKK ve ilgili mevzuata uygun olarak; hesabınızın oluşturulması, içerik paylaşımı, moderasyon, performans ve güvenlik amaçlarıyla işlenecektir. Verileriniz, hukuki yükümlülükler veya açık rızanız kapsamında gerektiğinde üçüncü taraf hizmet sağlayıcılarıyla paylaşılabilir. Detaylı bilgilendirme için Gizlilik Politikası ve Kullanım Koşulları’nı inceleyiniz.</p>
                    </div>
                    <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} className="mt-1" />
                      <span>Gizlilik ve Aydınlatma Metni’ni okudum, kabul ediyorum.</span>
                    </label>
                    <ErrorDisplay message={error} />
                    <button type="submit" className={`${commonButtonClass} mt-4`}>Kayıt Ol</button>
                </form>
            )}
        </div>
    </div>
  );
};

export default AuthPage;