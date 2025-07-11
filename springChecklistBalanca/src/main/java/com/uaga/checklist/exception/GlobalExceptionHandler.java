package com.uaga.checklist.exception;

import com.uaga.checklist.dto.response.ErrorResponseDto;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;

/**
 * Manipulador global de exceções para a API.
 * Centraliza o tratamento de erros e formata as respostas de erro de forma consistente.
 */
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Manipula exceções de regras de negócio e "não encontrado" (ResponseStatusException).
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponseDto> handleResponseStatusException(ResponseStatusException ex, WebRequest request) {
        ErrorResponseDto errorDetails = new ErrorResponseDto(
                LocalDateTime.now(),
                ex.getStatusCode().value(),
                HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase(),
                ex.getReason(), // Esta é a mensagem customizada que definimos no serviço!
                request.getDescription(false).replace("uri=", "")
        );
        return new ResponseEntity<>(errorDetails, ex.getStatusCode());
    }

    /**
     * Manipula erros de validação de DTOs (@Valid).
     * Fornece uma resposta detalhada com todos os campos que falharam na validação.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());

        // Coleta todos os erros de validação dos campos
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(x -> x.getDefaultMessage())
                .collect(Collectors.toList());

        body.put("errors", errors);
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, headers, status);
    }
    
    /**
     * Manipulador genérico para qualquer outra exceção não tratada.
     * Evita que a aplicação exponha stack traces completos.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGlobalException(Exception ex, WebRequest request) {
        ErrorResponseDto errorDetails = new ErrorResponseDto(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Ocorreu um erro inesperado no servidor. Por favor, contate o suporte.",
                request.getDescription(false).replace("uri=", "")
        );
        // É uma boa prática logar a exceção completa aqui para fins de depuração
        // logger.error("Unhandled exception occurred", ex);
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
