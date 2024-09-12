import { apiFetch, apiFetchPost, getLastApiError } from "./frontend.api.js";
import { dm } from "./frontend.dm.js";
import { addSpinner, hideModals, removeSpinner, setButtonsDisabled, showModal } from "./frontend.utils.js";

export async function handleEditUsersModal(wikiPath, $oldModal) {
	const users = await loadUsers(wikiPath, $oldModal);

	if (!users) {
		return;
	}

	const $usersModal = document.querySelector("#users-modal");

	$usersModal.q("tbody").innerHTML = "";

	users.forEach(user => addRow(user));

	showModal($usersModal);

	const onButton = async e => {
		if (e.target.classList.contains("action-save")) {
			await save(wikiPath);
			// teardown();
			// showModal($oldModal);

		} else if (e.target.classList.contains("action-close")) {
			teardown();
			showModal($oldModal);

		} else if (e.target.classList.contains("action-add")) {
			addRow("", e.target.closest("tr"));

		} else if (e.target.classList.contains("action-remove")) {
			e.target.closest("tr").remove();
		}
	};

	const teardown = () => {
		$usersModal.removeEventListener("click", onButton);

		hideModals();
	};

	$usersModal.addEventListener("click", onButton);
}

async function save(wikiPath) {
	const $usersModal = document.querySelector("#users-modal");
	const $saveButton = $usersModal.q(".action-save");
	addSpinner($saveButton);

	setButtonsDisabled($usersModal, true);

	const users = Array.from($usersModal.qA("tbody tr")).map($row => {
		const $username = $row.q(".name-cell input");
		const $password = $row.q(".password-cell input");

		if ($username.disabled || $password.disabled) {
			return {
				username: $username.value,
				password: null,
				keepPassword: true
			};
		}

		if (!$username.value) {
			return null;
		}


		return {
			username: $username.value,
			password: $password.value,
			keepPassword: false
		};
	}).filter(x => x);

	const csrf = await apiFetch("csrf/generate");
	await apiFetchPost(`wiki/users/update/${wikiPath}`, { csrf, users });

	removeSpinner($saveButton);
	setButtonsDisabled($usersModal, false);

	if (getLastApiError()) {
		alert(`Error while saving: ${getLastApiError()}`);
		return false;
	}

	return true;
}

function addRow(user, $after = undefined) {
	document.q("#users-modal tbody").insertBefore(getUserRow(user), $after?.nextSibling);
}

async function loadUsers(wikiPath, $oldModal) {
	const $button = $oldModal.q(".modal-action-edit-users");
	setButtonsDisabled($oldModal, true);
	addSpinner($button);

	const users = await apiFetch(`wiki/users/list/${wikiPath}`);

	setButtonsDisabled($oldModal, false);
	removeSpinner($button);

	if (getLastApiError()) {
		alert(`An error has occurred: ${getLastApiError()}`);
		return false;
	}

	return users;
}

function getUserRow(username) {
	return dm("tr", [
		dm("td", {
			class: "name-cell", child: [
				dm("input", { autocomplete: "off", name: "name", value: username, disabled: !!username })
			]
		}),
		dm("td", {
			class: "password-cell", child: [
				dm("input", { name: "password", type: "password", value: username ? "this is secret" : "", disabled: !!username })
			]
		}),
		dm("td", {
			class: "actions-cell", child: [
				dm("button", { class: "action-add small", child: dm("~gg-math-plus") }),
				dm("button", { class: "action-remove small danger", disabled: !!username, child: dm("~gg-math-minus") }),
			]
		})
	]);
}