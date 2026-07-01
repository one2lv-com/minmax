; ============================================================================
; One2lvOS Phase 9 - Inno Setup Installer Script (Windows 11)
; (Delta9) 9-Layer Delta Engine | (Cubed) 3D Vectors
; ============================================================================

#define MyAppName "One2lvOS Phase 9"
#define MyAppVersion "9.0.0"
#define MyAppPublisher "One2lvOS"
#define MyAppURL "https://github.com/one2lv-com/minmax"
#define MyAppExeName "one2lv-phase9.bat"

[Setup]
AppId={{B7C9E3A4-8F5D-4A2E-9B6C-1D3F7E8A9B2C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/issues
DefaultDirName={autopf}\One2lvOS
DefaultGroupName=One2lvOS
DisableProgramGroupPage=yes
OutputDir=output
OutputBaseFilename=One2lvOS-Phase9-v{#MyAppVersion}-Windows-Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayName={#MyAppName}
VersionInfoVersion={#MyAppVersion}
VersionInfoCompany={#MyAppPublisher}
VersionInfoDescription={#MyAppName} - Autonomous Delta Engine
VersionInfoProductName={#MyAppName}
VersionInfoProductVersion={#MyAppVersion}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\opt\*"; DestDir: "{app}\opt"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme
Source: "..\windows\*"; DestDir: "{app}\windows"; Flags: ignoreversion recursesubdirs createallsubdirs

[Dirs]
Name: "{app}\opt\one2lv\memory"
Name: "{app}\opt\one2lv\vector"
Name: "{app}\opt\one2lv\logs"

[Icons]
Name: "{group}\One2lvOS Phase 9"; Filename: "{app}\windows\one2lv-phase9.bat"
Name: "{group}\One2lvOS Phase 9 (PowerShell)"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\windows\launch.ps1"""
Name: "{group}\Uninstall One2lvOS Phase 9"; Filename: "{uninstallexe}"

Name: "{autodesktop}\One2lvOS Phase 9"; Filename: "{app}\windows\one2lv-phase9.bat"; Tasks: desktopicon

[Run]
Filename: "{app}\windows\install.ps1"; Parameters: "-ExecutionPolicy Bypass"; Description: "Install Node.js dependencies and initialize"; Flags: waituntilterminated skipifdoesntexist