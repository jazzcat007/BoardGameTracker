# Security Considerations for Scorecard Implementation

## Overview
This document outlines security considerations and recommendations for the scorecard (score sheet) implementation in BoardGameTracker.

## Current Security Status

### Critical Issues ⚠️

#### 1. Missing Authorization Controls
**Status**: Not Implemented
**Severity**: HIGH

**Issue**: 
- No authorization checks exist in the ScoreSheetTemplate and ScoreSession controllers
- Any authenticated user can:
  - View all score sheet templates (including private ones)
  - View all score sessions from all users
  - Modify or delete any score sheet template or session
  - Complete sessions created by other users

**Vulnerable Endpoints**:
- `GET /api/score-sheet-template` - Returns all templates (including private)
- `GET /api/score-session` - Returns all sessions from all users
- `PUT /api/score-sheet-template` - Can update any template
- `DELETE /api/score-sheet-template/{id}` - Can delete any template
- `PUT /api/score-session` - Can update any session
- `DELETE /api/score-session/{id}` - Can delete any session
- `POST /api/score-session/{id}/complete` - Can complete any session

**Recommendations**:
1. **Implement Resource-Based Authorization**:
   - Add authorization policies to verify user ownership before updates/deletes
   - Check `CreatedByUserId` matches the authenticated user's ID

2. **Add Authorization Attributes**:
   ```csharp
   [Authorize] // Require authentication
   [Route("api/score-sheet-template")]
   public class ScoreSheetTemplateController : ControllerBase
   ```

3. **Filter Results by User**:
   - `GetAllTemplates()` should only return public templates or user's own templates
   - `GetAllSessions()` should only return user's own sessions

4. **Add Ownership Checks in Services**:
   ```csharp
   public async Task<ScoreSheetTemplate> Update(ScoreSheetTemplate template, string userId)
   {
       var existing = await _repository.GetByIdAsync(template.Id);
       if (existing.CreatedByUserId != userId)
           throw new UnauthorizedException("You don't have permission to update this template");
       // ... rest of update logic
   }
   ```

#### 2. User ID Spoofing Risk
**Status**: Vulnerable
**Severity**: HIGH

**Issue**:
- `CreatedByUserId` is accepted from the client in ViewModels
- Malicious clients can set any user ID when creating resources
- No server-side enforcement of the authenticated user's ID

**Vulnerable Code**:
```csharp
[HttpPost]
public async Task<IActionResult> CreateTemplate([FromBody] ScoreSheetTemplateViewModel viewModel)
{
    var template = _mapper.Map<ScoreSheetTemplate>(viewModel);
    // CreatedByUserId comes from client - can be spoofed!
    template = await _scoreSheetTemplateService.Create(template);
    // ...
}
```

**Recommendations**:
1. **Server-Side User ID Assignment**:
   ```csharp
   [HttpPost]
   public async Task<IActionResult> CreateTemplate([FromBody] ScoreSheetTemplateViewModel viewModel)
   {
       var template = _mapper.Map<ScoreSheetTemplate>(viewModel);
       // Get user ID from authenticated context
       template.CreatedByUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
       template = await _scoreSheetTemplateService.Create(template);
       // ...
   }
   ```

2. **Remove CreatedByUserId from ViewModels**:
   - Don't accept `CreatedByUserId` from client requests
   - Always set it server-side from the authenticated user context

### Medium Issues ⚠️

#### 3. JSON Injection Risk
**Status**: Vulnerable
**Severity**: MEDIUM

**Issue**:
- `JsonDefinition` and `JsonData` fields accept arbitrary JSON from clients
- No validation of JSON structure or content
- Could potentially store malicious payloads

**Recommendations**:
1. **Validate JSON Structure**:
   ```csharp
   private bool IsValidJsonDefinition(string json)
   {
       try
       {
           var definition = JsonSerializer.Deserialize<ScoreSheetDefinition>(json);
           // Validate structure, max sizes, etc.
           return true;
       }
       catch
       {
           return false;
       }
   }
   ```

2. **Add Size Limits**:
   - Set maximum size for JSON fields to prevent storage abuse
   - Consider adding database column size constraints

3. **Sanitize on Output**:
   - When rendering JSON to clients, ensure proper escaping

#### 4. Missing Rate Limiting
**Status**: Not Implemented
**Severity**: MEDIUM

**Issue**:
- No rate limiting on API endpoints
- Vulnerable to:
  - Brute force attacks
  - DoS attacks
  - Resource exhaustion

**Recommendations**:
1. Implement rate limiting middleware
2. Add throttling policies per user/IP
3. Monitor and log excessive requests

#### 5. Incomplete Error Messages
**Status**: Fixed (but consider)
**Severity**: LOW-MEDIUM

**Current State**:
- Error messages now provide context but should not leak sensitive information
- Ensure stack traces are never returned to clients in production

**Recommendations**:
- Review error messages to ensure no sensitive data leakage
- Use environment-based error detail levels
- Log full details server-side, return generic messages to clients

### Low Issues ℹ️

#### 6. Audit Logging
**Status**: Not Implemented
**Severity**: LOW

**Issue**:
- No audit trail for sensitive operations
- Cannot track who created, modified, or deleted resources
- Difficult to investigate security incidents

**Recommendations**:
1. Implement audit logging for:
   - Create/Update/Delete operations
   - Permission changes
   - Failed authorization attempts
2. Store: UserId, Action, Timestamp, Resource ID, IP Address
3. Make audit logs immutable and retention-compliant

#### 7. Data Retention and Privacy
**Status**: No Policy
**Severity**: LOW

**Issue**:
- No data retention policy
- No mechanism for users to delete their data
- Soft delete not implemented

**Recommendations**:
1. Implement soft delete functionality
2. Add data retention policies
3. Provide user data export/deletion capabilities
4. Consider GDPR compliance requirements

## Implementation Priority

### Phase 1: Critical (Immediate)
1. ✅ Fix error handling and logging
2. ✅ Add input validation
3. 🔴 Implement authorization controls
4. 🔴 Fix user ID spoofing

### Phase 2: Important (Short-term)
5. Validate JSON content
6. Implement rate limiting
7. Review error messages for information leakage

### Phase 3: Recommended (Medium-term)
8. Add audit logging
9. Implement data retention policies
10. Add comprehensive security testing

## Testing Recommendations

### Security Test Scenarios
1. **Authorization Tests**:
   - Attempt to access other users' resources
   - Attempt to modify/delete other users' resources
   - Verify private templates are not visible to other users

2. **Input Validation Tests**:
   - Test with oversized JSON payloads
   - Test with malformed JSON
   - Test with SQL injection patterns (though using EF Core helps)
   - Test with XSS patterns in text fields

3. **Authentication Tests**:
   - Test endpoints without authentication
   - Test with expired tokens
   - Test with invalid credentials

## Security Best Practices Applied ✅

1. ✅ **Parameterized Queries**: Using Entity Framework Core prevents SQL injection
2. ✅ **Input Validation**: Added validation in service layer
3. ✅ **Error Handling**: Improved logging without exposing stack traces to clients
4. ✅ **Dependency Injection**: Proper use of DI container
5. ✅ **Separation of Concerns**: Clean architecture maintained

## Security Best Practices Needed 🔴

1. 🔴 **Authorization**: Not implemented
2. 🔴 **Authentication Verification**: Not enforced on endpoints
3. 🔴 **Rate Limiting**: Not implemented
4. 🔴 **Audit Logging**: Not implemented
5. 🔴 **User ID Verification**: Server-side enforcement needed

## Conclusion

The scorecard implementation has a solid architectural foundation but requires critical security improvements before production deployment. The most urgent needs are:

1. Authorization controls to prevent unauthorized access
2. Server-side user ID enforcement to prevent spoofing
3. JSON content validation to prevent malicious payloads

These security gaps represent significant risks that should be addressed before the feature is released to users.
