package com.auth_service.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${MAIL_FROM}")
    private String mailFrom;

    public void sendPasswordSetupMail(String to, String setupLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(to);
        message.setSubject("Staffly - Şifre Oluşturma");
        message.setText(
                "Merhaba,\n\n" +
                        "Staffly hesabınız oluşturuldu.\n" +
                        "Şifrenizi oluşturmak için aşağıdaki linke tıklayın:\n\n" +
                        setupLink + "\n\n" +
                        "Bu link belirli bir süre sonra geçersiz olacaktır.\n\n" +
                        "Staffly HR Management System"
        );

        mailSender.send(message);
    }

    public void sendPasswordResetMail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(to);
        message.setSubject("Staffly - Şifre Sıfırlama");
        message.setText(
                "Merhaba,\n\n" +
                        "Staffly hesabınız için şifre sıfırlama talebi alındı.\n" +
                        "Yeni şifrenizi oluşturmak için aşağıdaki linke tıklayın:\n\n" +
                        resetLink + "\n\n" +
                        "Bu link belirli bir süre sonra geçersiz olacaktır.\n\n" +
                        "Eğer bu talebi siz oluşturmadıysanız bu maili dikkate almayabilirsiniz.\n\n" +
                        "Staffly HR Management System"
        );

        mailSender.send(message);
    }
}