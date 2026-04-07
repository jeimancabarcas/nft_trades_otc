---
name: primeng-developer
description: Generates PrimeNG code and provides guidance on implementation, theming, scaling, and integration with Tailwind CSS. Trigger when creating or modifying PrimeNG components.
---

# PrimeNG Development Skill

You are an expert PrimeNG developer optimized for modern Angular (versions 16-19+). You must build interfaces and configure PrimeNG using the official local documentation stored in the `.agents/skills/primeng-developer/references` directory. 

## 📚 Dynamic Knowledge Base (`references/`)
Whenever you need to implement a component or perform configuration, **you MUST use the `view_file` tool to read the precise markdown file listed below** before writing any code. All following files are located inside `c:/Users/jeima/Desktop/TrandingETH/frontend/tradingNft/.agents/skills/primeng-developer/references/`. 

### 1. Guides (`pages/`)
- `pages/installation.md`: Setting up PrimeNG in an Angular CLI project.
- `pages/configuration.md`: Application wide configuration for PrimeNG.
- `pages/styled.md`: Choose from a variety of pre-styled themes or develop your own.
- `pages/unstyled.md`: Theming PrimeNG with alternative styling approaches.
- `pages/icons.md`: PrimeIcons is the default icon library of PrimeNG with over 250 open source icons.
- `pages/customicons.md`: Use custom icons with PrimeNG components.
- `pages/passthrough.md`: Pass Through Props allow direct access to the underlying elements for complete customization.
- `pages/tailwind.md`: Integration between PrimeNG and Tailwind CSS.
- `pages/accessibility.md`: PrimeNG has WCAG 2.1 AA level compliance.
- `pages/animations.md`: Built-in CSS animations for PrimeNG components.
- `pages/rtl.md`: Right-to-left support for PrimeNG components.
- `pages/v19.md`: Migration guide to PrimeNG v19.
- `pages/v20.md`: Migration guide to PrimeNG v20.
- `pages/v21.md`: Migration guide to PrimeNG v21.

### 2. Components (`components/`)
- `components/accordion.md`: Accordion groups a collection of contents in tabs.
- `components/animateonscroll.md`: AnimateOnScroll is used to apply animations to elements when entering or leaving the viewport during scrolling.
- `components/autocomplete.md`: AutoComplete is an input component that provides real-time suggestions when being typed.
- `components/autofocus.md`: AutoFocus manages focus on focusable element on load.
- `components/avatar.md`: Avatar represents people using icons, labels and images.
- `components/badge.md`: Badge is a small status indicator for another element.
- `components/blockui.md`: BlockUI can either block other components or the whole page.
- `components/breadcrumb.md`: Breadcrumb provides contextual information about page hierarchy.
- `components/button.md`: Button is an extension to standard button element with icons and theming.
- `components/card.md`: Card is a flexible container component.
- `components/carousel.md`: Carousel is a content slider featuring various customization options.
- `components/cascadeselect.md`: CascadeSelect displays a nested structure of options.
- `components/chart.md`: Chart components are based on Charts.js 3.3.2+, an open source HTML5 based charting library.
- `components/checkbox.md`: Checkbox is an extension to standard checkbox element with theming.
- `components/chip.md`: Chip represents entities using icons, labels and images.
- `components/colorpicker.md`: ColorPicker is an input component to select a color.
- `components/confirmdialog.md`: ConfirmDialog is backed by a service utilizing Observables to display confirmation windows easily that can be shared by multiple actions on the same component.
- `components/confirmpopup.md`: ConfirmPopup displays a confirmation overlay displayed relatively to its target.
- `components/contextmenu.md`: ContextMenu displays an overlay menu on right click of its target.
- `components/dataview.md`: DataView displays data in grid grid-cols-12 gap-4 or list layout with pagination and sorting features.
- `components/datepicker.md`: DatePicker is an input component to select a date.
- `components/dialog.md`: Dialog is a container to display content in an overlay window.
- `components/divider.md`: Divider is used to separate contents.
- `components/dock.md`: Dock is a navigation component consisting of menuitems.
- `components/dragdrop.md`: pDraggable and pDroppable directives apply drag-drop behaviors to any element.
- `components/drawer.md`: Drawer is a container component displayed as an overlay.
- `components/dynamicdialog.md`: Dialogs can be created dynamically with any component as the content using a DialogService.
- `components/editor.md`: Editor is rich text editor component based on Quill.
- `components/fieldset.md`: Fieldset is a grouping component with a content toggle feature.
- `components/fileupload.md`: FileUpload is an advanced uploader with dragdrop support, multi file uploads, auto uploading, progress tracking and validations.
- `components/floatlabel.md`: FloatLabel appears on top of the input field when focused.
- `components/fluid.md`: Fluid is a layout component to make descendant components span full width of their container.
- `components/focustrap.md`: Focus Trap keeps focus within a certain DOM element while tabbing.
- `components/galleria.md`: Galleria is an advanced content gallery component.
- `components/iconfield.md`: IconField wraps an input and an icon.
- `components/iftalabel.md`: IftaLabel is used to create infield top aligned labels.
- `components/image.md`: Displays an image with preview and tranformation options.
- `components/imagecompare.md`: Compare two images side by side with a slider.
- `components/inplace.md`: Inplace provides an easy to do editing and display at the same time where clicking the output displays the actual content.
- `components/inputgroup.md`: Text, icon, buttons and other content can be grouped next to an input.
- `components/inputmask.md`: InputMask component is used to enter input in a certain format such as numeric, date, currency and phone.
- `components/inputnumber.md`: InputNumber is an input component to provide numerical input.
- `components/inputtext.md`: InputText is an extension to standard input element with theming and keyfiltering.
- `components/keyfilter.md`: KeyFilter is a directive to restrict individual key strokes. In order to restrict the whole input, use InputNumber or InputMask instead.
- `components/knob.md`: Knob is a form component to define number inputs with a dial.
- `components/listbox.md`: Listbox is used to select one or more values from a list of items.
- `components/megamenu.md`: MegaMenu is navigation component that displays submenus together.
- `components/menu.md`: Menu is a navigation / command component that supports dynamic and static positioning.
- `components/menubar.md`: Menubar is a horizontal menu component.
- `components/message.md`: Message component is used to display inline messages.
- `components/metergroup.md`: MeterGroup displays scalar measurements within a known range.
- `components/multiselect.md`: MultiSelect is used to select multiple items from a collection.
- `components/orderlist.md`: OrderList is used to sort a collection.
- `components/organizationchart.md`: OrganizationChart visualizes hierarchical organization data.
- `components/inputotp.md`: Input Otp is used to enter one time passwords.
- `components/paginator.md`: Paginator displays data in paged format and provides navigation between pages.
- `components/panel.md`: Panel is a container component with an optional content toggle feature.
- `components/panelmenu.md`: PanelMenu is a hybrid of Accordion and Tree components.
- `components/password.md`: Password displays strength indicator for password fields.
- `components/picklist.md`: PickList is used to reorder items between different lists.
- `components/popover.md`: Popover is a container component that can overlay other components on page.
- `components/progressbar.md`: ProgressBar is a process status indicator.
- `components/progressspinner.md`: ProgressSpinner is a process status indicator.
- `components/radiobutton.md`: RadioButton is an extension to standard radio button element with theming.
- `components/rating.md`: Rating component is a star based selection input.
- `components/ripple.md`: Ripple directive adds ripple effect to the host element.
- `components/scrollpanel.md`: ScrollPanel is a cross browser, lightweight and skinnable alternative to native browser scrollbar.
- `components/scrolltop.md`: ScrollTop gets displayed after a certain scroll position and used to navigates to the top of the page quickly.
- `components/select.md`: Select is used to choose an item from a collection of options.
- `components/selectbutton.md`: SelectButton is used to choose single or multiple items from a list using buttons.
- `components/skeleton.md`: Skeleton is a placeholder to display instead of the actual content.
- `components/slider.md`: Slider is a component to provide input with a drag handle.
- `components/speeddial.md`: SpeedDial is a floating button with a popup menu.
- `components/splitbutton.md`: SplitButton groups a set of commands in an overlay with a default action item.
- `components/splitter.md`: Splitter is utilized to separate and resize panels.
- `components/stepper.md`: The Stepper component displays a wizard-like workflow by guiding users through the multi-step progression.
- `components/styleclass.md`: StyleClass manages css classes declaratively to during enter/leave animations or just to toggle classes on an element.
- `components/table.md`: Table displays data in tabular format.
- `components/tabs.md`: Tabs is a container component to group content with tabs.
- `components/tag.md`: Tag component is used to categorize content.
- `components/terminal.md`: Terminal component for defining text based console-like UI.
- `components/textarea.md`: Textarea adds styling and autoResize functionality to standard textarea element.
- `components/tieredmenu.md`: TieredMenu displays submenus in nested overlays.
- `components/timeline.md`: Timeline visualizes a series of chained events.
- `components/toast.md`: Toast is used to display messages in an overlay.
- `components/togglebutton.md`: ToggleButton is used to select a boolean value using a button.
- `components/toggleswitch.md`: ToggleSwitch is used to select a boolean value.
- `components/toolbar.md`: Toolbar is a grouping component for buttons and other content.
- `components/tooltip.md`: Tooltip directive provides advisory information for a component.
- `components/tree.md`: Tree is used to display hierarchical data.
- `components/treeselect.md`: TreeSelect is a form component to choose from hierarchical data.
- `components/treetable.md`: TreeTable is used to display hierarchical data in tabular format.
- `components/scroller.md`: VirtualScroller is a performance-approach to handle huge data efficiently.
- `components/overlay.md`: Overlay API allows overlay components to be controlled from the PrimeNG, providing common behaviors.

## 📋 General Architectural Rules

### 1. Setup and Initialization
- Configure PrimeNG globally via standalone APIs (`providePrimeNG()`, `provideAnimationsAsync()`).

### 2. Theming and Design Systems
- **Preset Customization**: Customize themes by overriding design tokens using `definePreset` rather than `::ng-deep` CSS.
- **Dark Mode**: Managed natively using tokens (`darkModeSelector: 'system'`).
- **Tailwind (`tailwindcss-primeui`)**: Use PassThrough `[pt]` attributes to cleanly apply Tailwind CSS to specific component DOM elements. Manage overrides via CSS Layers (`@layer primeng`).

### 3. UI Component Construction
- Utilize standalone component imports rigorously. Avoid full package or generic module imports. E.g., `import { ButtonModule } from 'primeng/button';`.
- Retain high code quality with Angular Signals where applicable.
