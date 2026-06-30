'use client'
import {useState, useCallback} from 'react';
import { changePassword, hasFoundPhoneNumber } from '../../actions';
import OTPForm from '../../components/forms/OTPForm';
import { useToast } from '@/app/hooks/toast';


export default function ForgotPassword() {
    const [phone, setPhone] = useState<string>('+7');
    const [step, setStep] = useState<'phone'|'otp'|'change'>('phone');
    const [password, setPassword] = useState<string>('');
    
    const {showToast, ToastComponent} = useToast(); 
    
    
    const handlePhoneSubmit = useCallback(async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(await hasFoundPhoneNumber(phone) === true){
        setStep('otp');
        }
        else {
            showToast('Ошибка! Не найден телефонный номер в базе данных', 'error')
        }
    }, [phone, showToast])
    
    const handlePasswordChange = useCallback((password: string) => {
       changePassword(phone, password)
    },[phone])


    if (step === 'phone'){
    return(<>
        {ToastComponent}
        <form className = 'form-control' onSubmit = {(e) => handlePhoneSubmit(e)} style={{justifyContent: 'center', margin: 'auto'
                    }}>                
        <div className = 'input-group' style = {{justifyContent : 'center'}}>
            <label>
             Введите ваш номер телефона
            </label>
            <p className = 'input-label' style={{fontSize: '1rem'}}>Внимание! Смена пароля работает только для администраторов и директоров.
                Если вы — врач, и забыли свой пароль, обратитесь к вашему администратору.
            </p>
            <input value = {phone} onChange ={(e) => setPhone(e.target.value)} className = 'form-control' style={{}}/>
            <button type = 'submit' className = 'btn btn-primary' style = {{marginLeft: 'auto'}}>Подтвердить</button>
        </div>
        </form> 
        </>
   )}
   if (step === 'otp'){
    return(<div style={{minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "2rem",
                    background: "var(--bg-primary)",}}>
        <OTPForm phone = {phone}
        onVerified = {() => setStep('change')}
        onCancel = {() => setStep('phone')}
        />
        </div>
    )
   }
   if (step === 'change'){
    return(
        <form>
            <div>
                <label>Введите новый пароль</label>
                <input/>
                <input/>
                <button>Подтвердить</button>
            </div>
        </form>
    )
   }

}