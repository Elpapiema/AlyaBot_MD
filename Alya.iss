; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "AlyaBot"
#define MyAppVersion "2.0.1"
#define MyAppPublisher "Emma (Violet`s Version)"
#define MyAppURL "https://github.com/Elpapiema/AlyaBot_MD"
#define MyAppExeName "alya.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{44686298-BBC8-4977-82F8-CC51C2A39BBE}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
UninstallDisplayIcon={app}\{#MyAppExeName}
DisableProgramGroupPage=yes
LicenseFile=C:\Users\Emma Violets Version\Desktop\WA_Bots\AlyaBot_MD\LICENSE_ES.txt
InfoAfterFile=C:\Users\Emma Violets Version\Desktop\WA_Bots\AlyaBot_MD\thanks.txt
; Remove the following line to run in administrative install mode (install for all users).
PrivilegesRequired=lowest
OutputDir=C:\Users\Emma Violets Version\Desktop
OutputBaseFilename=AlyaBot_v2.0.1-installer
SetupIconFile=C:\Users\Emma Violets Version\Desktop\Anime_-Alya-Sometimes-Hides-Her-Feelings-in-Russian.ico
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\Users\Emma Violets Version\Desktop\WA_Bots\AlyaBot_MD\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\Emma Violets Version\Desktop\WA_Bots\AlyaBot_MD\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

